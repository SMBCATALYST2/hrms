import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Switch,
  Alert,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Calendar, type DateData } from "react-native-calendars";
import { format, differenceInDays, addDays } from "date-fns";
import { Ionicons } from "@expo/vector-icons";

import { useLeaveBalance, useApplyLeave } from "../../hooks/use-leaves";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";

export default function ApplyLeaveScreen() {
  const router = useRouter();
  const { data: balances } = useLeaveBalance();
  const applyLeave = useApplyLeave();

  const [selectedLeaveType, setSelectedLeaveType] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);
  const [halfDay, setHalfDay] = useState(false);
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectingDate, setSelectingDate] = useState<"from" | "to" | null>(null);

  const selectedBalance = balances?.find(
    (b) => b.leave_type_id === selectedLeaveType
  );

  const totalDays =
    fromDate && toDate
      ? differenceInDays(new Date(toDate), new Date(fromDate)) + 1
      : 0;

  // Build marked dates for range selection
  const markedDates: Record<string, any> = {};
  if (fromDate) {
    markedDates[fromDate] = {
      startingDay: true,
      color: "#3B82F6",
      textColor: "#fff",
    };
    if (toDate) {
      markedDates[toDate] = {
        endingDay: true,
        color: "#3B82F6",
        textColor: "#fff",
      };
      // Fill range
      if (fromDate !== toDate) {
        let current = addDays(new Date(fromDate), 1);
        const end = new Date(toDate);
        while (current < end) {
          markedDates[format(current, "yyyy-MM-dd")] = {
            color: "#DBEAFE",
            textColor: "#1D4ED8",
          };
          current = addDays(current, 1);
        }
      }
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!selectedLeaveType) newErrors.leaveType = "Please select a leave type";
    if (!fromDate) newErrors.fromDate = "Please select a start date";
    if (!toDate) newErrors.toDate = "Please select an end date";
    if (!reason.trim()) newErrors.reason = "Please provide a reason";
    if (
      selectedBalance &&
      totalDays > selectedBalance.available
    ) {
      newErrors.leaveType = `Only ${selectedBalance.available} days available`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    applyLeave.mutate(
      {
        leave_type_id: selectedLeaveType!,
        from_date: fromDate!,
        to_date: toDate!,
        half_day: halfDay,
        half_day_date: halfDay ? fromDate! : undefined,
        reason: reason.trim(),
      },
      {
        onSuccess: () => {
          Alert.alert("Success", "Leave application submitted successfully.", [
            { text: "OK", onPress: () => router.back() },
          ]);
        },
        onError: (error: any) => {
          Alert.alert(
            "Error",
            error?.response?.data?.message || "Failed to submit leave application."
          );
        },
      }
    );
  };

  const handleDateSelect = (day: DateData) => {
    const dateStr = day.dateString;
    if (selectingDate === "from") {
      setFromDate(dateStr);
      if (toDate && dateStr > toDate) {
        setToDate(dateStr);
      }
      setSelectingDate("to");
    } else if (selectingDate === "to") {
      if (fromDate && dateStr < fromDate) {
        setFromDate(dateStr);
        setToDate(dateStr);
      } else {
        setToDate(dateStr);
      }
      setSelectingDate(null);
    } else {
      setFromDate(dateStr);
      setToDate(dateStr);
      setSelectingDate("to");
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-neutral-50 px-4"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Leave Type Picker */}
      <Text className="text-sm font-medium text-neutral-700 mt-4 mb-2">
        Leave Type
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-1"
      >
        {balances?.map((balance) => (
          <TouchableOpacity
            key={balance.leave_type_id}
            className={`mr-2 px-4 py-2.5 rounded-xl border ${
              selectedLeaveType === balance.leave_type_id
                ? "bg-primary-500 border-primary-500"
                : "bg-white border-neutral-200"
            }`}
            onPress={() => setSelectedLeaveType(balance.leave_type_id)}
            activeOpacity={0.7}
          >
            <Text
              className={`text-sm font-medium ${
                selectedLeaveType === balance.leave_type_id
                  ? "text-white"
                  : "text-neutral-700"
              }`}
            >
              {balance.leave_type_name}
            </Text>
            <Text
              className={`text-xs mt-0.5 ${
                selectedLeaveType === balance.leave_type_id
                  ? "text-primary-100"
                  : "text-neutral-400"
              }`}
            >
              {balance.available} available
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {errors.leaveType && (
        <Text className="text-xs text-danger-500 mt-1">{errors.leaveType}</Text>
      )}

      {/* Date Selection */}
      <View className="flex-row gap-3 mt-4 mb-2">
        <TouchableOpacity
          className={`flex-1 border rounded-xl p-3 ${
            selectingDate === "from"
              ? "border-primary-500 bg-primary-50"
              : "border-neutral-200 bg-white"
          }`}
          onPress={() => setSelectingDate("from")}
        >
          <Text className="text-xs text-neutral-400 mb-0.5">From</Text>
          <Text className="text-sm font-medium text-neutral-800">
            {fromDate ? format(new Date(fromDate), "dd MMM yyyy") : "Select date"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 border rounded-xl p-3 ${
            selectingDate === "to"
              ? "border-primary-500 bg-primary-50"
              : "border-neutral-200 bg-white"
          }`}
          onPress={() => setSelectingDate("to")}
        >
          <Text className="text-xs text-neutral-400 mb-0.5">To</Text>
          <Text className="text-sm font-medium text-neutral-800">
            {toDate ? format(new Date(toDate), "dd MMM yyyy") : "Select date"}
          </Text>
        </TouchableOpacity>
      </View>
      {(errors.fromDate || errors.toDate) && (
        <Text className="text-xs text-danger-500 mb-1">
          {errors.fromDate || errors.toDate}
        </Text>
      )}

      {/* Calendar */}
      <Card className="mb-4" padding={false}>
        <Calendar
          onDayPress={handleDateSelect}
          markedDates={markedDates}
          markingType="period"
          minDate={format(new Date(), "yyyy-MM-dd")}
          theme={{
            backgroundColor: "#ffffff",
            calendarBackground: "#ffffff",
            selectedDayBackgroundColor: "#3B82F6",
            selectedDayTextColor: "#ffffff",
            todayTextColor: "#3B82F6",
            dayTextColor: "#111827",
            textDisabledColor: "#D1D5DB",
            arrowColor: "#3B82F6",
            monthTextColor: "#111827",
            textMonthFontWeight: "bold",
            textDayFontSize: 14,
            textMonthFontSize: 16,
          }}
          style={{ borderRadius: 16, overflow: "hidden", padding: 8 }}
        />
      </Card>

      {/* Total Days */}
      {totalDays > 0 && (
        <View className="flex-row items-center bg-primary-50 rounded-xl px-4 py-3 mb-4">
          <Ionicons name="calendar" size={18} color="#3B82F6" />
          <Text className="text-sm font-medium text-primary-700 ml-2">
            Total: {halfDay ? 0.5 : totalDays}{" "}
            {(halfDay ? 0.5 : totalDays) === 1 ? "day" : "days"}
          </Text>
        </View>
      )}

      {/* Half Day Toggle */}
      <View className="flex-row items-center justify-between bg-white rounded-xl px-4 py-3 border border-neutral-200 mb-4">
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={18} color="#6B7280" />
          <Text className="text-sm font-medium text-neutral-700 ml-2">
            Half Day
          </Text>
        </View>
        <Switch
          value={halfDay}
          onValueChange={setHalfDay}
          trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
          thumbColor={halfDay ? "#3B82F6" : "#f4f3f4"}
        />
      </View>

      {/* Reason */}
      <Input
        label="Reason"
        placeholder="Enter the reason for your leave..."
        value={reason}
        onChangeText={setReason}
        error={errors.reason}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      {/* Submit */}
      <Button
        onPress={handleSubmit}
        loading={applyLeave.isPending}
        size="lg"
        className="mt-2 mb-8"
      >
        Submit Application
      </Button>
    </ScrollView>
  );
}
