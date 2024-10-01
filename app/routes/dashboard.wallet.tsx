import React, { useState } from "react";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { db } from "@/db/index.server";
import { getUser } from "@/utils/session.server";
import { users, orders, orderStatusEnum } from "@/db/schema";
import { eq, sum, desc, and } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { toast } from "~/components/hooks/use-toast";
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);

  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const totalEarnings = await db
    .select({ total: sum(orders.totalAmount) })
    .from(orders)
    .where(
      and(
        eq(orders.consumerId, user.id),
        eq(orders.status, "delivered")
        // jsonPath(orders.paymentInfo, "$.method").equals("razorpay")
      )
    )
    .execute();

  const withdrawals = user.amountWithdraw
    ? JSON.parse(user.amountWithdraw)
    : [];
  const totalWithdrawn = withdrawals.reduce(
    (acc, curr) => acc + curr.amount,
    0
  );

  const recentTransactions = await db
    .select({
      id: orders.id,
      amount: orders.totalAmount,
      createdAt: orders.createdAt,
      status: orders.status,
    })
    .from(orders)
    .where(eq(orders.consumerId, user.id))
    .orderBy(desc(orders.createdAt))
    .limit(5)
    .execute();

  return json({
    user,
    balance: (totalEarnings[0]?.total || 0) - totalWithdrawn,
    recentTransactions,
    withdrawals,
  });
}

export async function action({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);

  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const amount = Number(formData.get("amount"));
  const accountNumber = formData.get("accountNumber");
  const ifscCode = formData.get("ifscCode");

  if (isNaN(amount) || amount <= 0) {
    return json({ error: "Invalid amount" }, { status: 400 });
  }

  const totalEarnings = await db
    .select({ total: sum(orders.totalAmount) })
    .from(orders)
    .where(
      and(
        eq(orders.consumerId, user.id),
        eq(orders.status, "delivered")
        // jsonPath(orders.paymentInfo, "$.method").equals("razorpay")
      )
    )
    .execute();

  const withdrawals = user.amountWithdraw
    ? JSON.parse(user.amountWithdraw)
    : [];
  const totalWithdrawn = withdrawals.reduce(
    (acc, curr) => acc + curr.amount,
    0
  );
  const currentBalance = (totalEarnings[0]?.total || 0) - totalWithdrawn;

  if (amount > currentBalance) {
    return json({ error: "Insufficient balance" }, { status: 400 });
  }

  const newWithdrawal = {
    amount,
    accountNumber,
    ifscCode,
    timestamp: new Date().toISOString(),
  };

  await db
    .update(users)
    .set({
      amountWithdraw: JSON.stringify([...withdrawals, newWithdrawal]),
    })
    .where(eq(users.id, user.id))
    .execute();

  return json({ success: true });
}

export default function WalletPage() {
  const { user, balance, recentTransactions, withdrawals } =
    useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);

  const handleWithdraw = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    fetcher.submit(formData, { method: "post" });
    setIsWithdrawDialogOpen(false);
  };

  React.useEffect(() => {
    if (fetcher.data?.error) {
      toast({
        title: "Error",
        description: fetcher.data.error,
        variant: "destructive",
      });
    } else if (fetcher.data?.success) {
      toast({
        title: "Success",
        description: "Withdrawal request submitted successfully.",
      });
    }
  }, [fetcher.data]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Wallet</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">₹{balance.toFixed(2)}</p>
            <Dialog
              open={isWithdrawDialogOpen}
              onOpenChange={setIsWithdrawDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="mt-4">Withdraw</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Withdraw Funds</DialogTitle>
                  <DialogDescription>
                    Enter the amount you want to withdraw and your bank details.
                  </DialogDescription>
                </DialogHeader>
                <fetcher.Form onSubmit={handleWithdraw}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="amount" className="text-right">
                        Amount
                      </Label>
                      <Input
                        id="amount"
                        name="amount"
                        type="number"
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="accountNumber" className="text-right">
                        Account Number
                      </Label>
                      <Input
                        id="accountNumber"
                        name="accountNumber"
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="ifscCode" className="text-right">
                        IFSC Code
                      </Label>
                      <Input
                        id="ifscCode"
                        name="ifscCode"
                        className="col-span-3"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Submit Withdrawal</Button>
                  </DialogFooter>
                </fetcher.Form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>₹{transaction.amount.toFixed(2)}</TableCell>
                    <TableCell>{transaction.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Account Number</TableHead>
                <TableHead>IFSC Code</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((withdrawal, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {new Date(withdrawal.timestamp).toLocaleDateString()}
                  </TableCell>
                  <TableCell>₹{withdrawal.amount.toFixed(2)}</TableCell>
                  <TableCell>{withdrawal.accountNumber}</TableCell>
                  <TableCell>{withdrawal.ifscCode}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
