/**
 * Promotions Section View
 *
 * Displays active promotions, create-promotion form, and all-promotions table.
 * Owns promotion form state; receives addPromotion callback from parent.
 */

import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Tag } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { PROMOTION_STATUS_STYLES } from "../constants";
import type { Promotion } from "../../../lib/admin/types";

interface CreatePromotionInput {
  name: string;
  code: string;
  discountType: "percent" | "flat";
  discountValue: number;
  startDate: string;
  endDate: string;
}

interface PromotionsSectionViewProps {
  promotions: Promotion[];
  addPromotion: (promo: CreatePromotionInput) => Promise<void>;
  onPromotionError: (message: string | null) => void;
}

export function PromotionsSectionView({
  promotions,
  addPromotion,
  onPromotionError,
}: PromotionsSectionViewProps) {
  const [promotionFormOpen, setPromotionFormOpen] = useState(false);
  const [promotionForm, setPromotionForm] = useState<{
    name: string;
    code: string;
    discountType: "percent" | "flat";
    discountValue: string;
    startDate: string;
    endDate: string;
  }>({
    name: "",
    code: "",
    discountType: "percent",
    discountValue: "",
    startDate: "",
    endDate: "",
  });

  const activePromotions = promotions.filter((p) => p.status === "Active");

  const handleCreatePromotion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onPromotionError(null);
    const trimmedCode = promotionForm.code.trim().toUpperCase();
    const discountValue = Number(promotionForm.discountValue);
    if (
      !promotionForm.name.trim() ||
      !trimmedCode ||
      Number.isNaN(discountValue)
    ) {
      return;
    }
    try {
      await addPromotion({
        name: promotionForm.name.trim(),
        code: trimmedCode,
        discountType: promotionForm.discountType,
        discountValue,
        startDate:
          promotionForm.startDate || new Date().toISOString().slice(0, 10),
        endDate: promotionForm.endDate || new Date().toISOString().slice(0, 10),
      });
      setPromotionFormOpen(false);
      setPromotionForm({
        name: "",
        code: "",
        discountType: "percent",
        discountValue: "",
        startDate: "",
        endDate: "",
      });
    } catch (err) {
      onPromotionError(
        err instanceof Error ? err.message : "Failed to create promotion",
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Current Promotions
        </h1>
        <p className="text-slate-600 mt-2">
          Create and manage discounts for customer checkout.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Running Promotions</CardTitle>
                <CardDescription>
                  Active discounts live for customers
                </CardDescription>
              </div>
              <Tag className="h-5 w-5 text-slate-400" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {activePromotions.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-slate-500">
                No active promotions yet.
              </div>
            )}
            {activePromotions.map((promo) => (
              <div
                key={promo.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">
                      {promo.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      Code:{" "}
                      <span className="font-medium text-slate-900">
                        {promo.code}
                      </span>
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={PROMOTION_STATUS_STYLES[promo.status]}
                  >
                    {promo.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>
                    Discount:{" "}
                    <strong className="text-slate-900">
                      {promo.discountType === "percent"
                        ? `${promo.discountValue}%`
                        : `$${promo.discountValue}`}
                    </strong>
                  </span>
                  <span>
                    Ends:{" "}
                    <strong className="text-slate-900">
                      {promo.endDate}
                    </strong>
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Create Promotion</CardTitle>
                <CardDescription>
                  Add a new discount for checkout
                </CardDescription>
              </div>
              <motion.button
                onClick={() => setPromotionFormOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft className="h-3 w-3 rotate-180" />
                {promotionFormOpen ? "Hide Form" : "Create Promotion"}
              </motion.button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {promotionFormOpen ? (
              <form
                onSubmit={handleCreatePromotion}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Promotion Name
                  </label>
                  <Input
                    value={promotionForm.name}
                    onChange={(event) =>
                      setPromotionForm((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                    placeholder="January Reset"
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Code
                    </label>
                    <Input
                      value={promotionForm.code}
                      onChange={(event) =>
                        setPromotionForm((prev) => ({
                          ...prev,
                          code: event.target.value,
                        }))
                      }
                      placeholder="RESET20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Discount Value
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={promotionForm.discountValue}
                      onChange={(event) =>
                        setPromotionForm((prev) => ({
                          ...prev,
                          discountValue: event.target.value,
                        }))
                      }
                      placeholder="20"
                    />
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Discount Type
                    </label>
                    <select
                      value={promotionForm.discountType}
                      onChange={(event) =>
                        setPromotionForm((prev) => ({
                          ...prev,
                          discountType: event.target
                            .value as Promotion["discountType"],
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    >
                      <option value="percent">Percent</option>
                      <option value="flat">Flat Amount</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Start Date
                    </label>
                    <Input
                      type="date"
                      value={promotionForm.startDate}
                      onChange={(event) =>
                        setPromotionForm((prev) => ({
                          ...prev,
                          startDate: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={promotionForm.endDate}
                    onChange={(event) =>
                      setPromotionForm((prev) => ({
                        ...prev,
                        endDate: event.target.value,
                      }))
                    }
                  />
                </div>
                <motion.button
                  type="submit"
                  className="w-full rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 transition-colors"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Save Promotion
                </motion.button>
              </form>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-slate-500">
                Click "Create Promotion" to add a new discount.
              </div>
            )}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-medium text-slate-900 mb-1">
                Checkout integration
              </p>
              <p>
                New promotions will be available at customer checkout
                once connected to the pricing service.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Promotions</CardTitle>
          <CardDescription>
            Every campaign and scheduled offer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell className="font-medium">
                    {promo.name}
                  </TableCell>
                  <TableCell>{promo.code}</TableCell>
                  <TableCell>
                    {promo.discountType === "percent"
                      ? `${promo.discountValue}%`
                      : `$${promo.discountValue}`}
                  </TableCell>
                  <TableCell>
                    {promo.startDate} - {promo.endDate}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={PROMOTION_STATUS_STYLES[promo.status]}
                    >
                      {promo.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
