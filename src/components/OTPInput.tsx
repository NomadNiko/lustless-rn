import React, { useRef, useState } from "react";
import { AccessibilityInfo, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  isInvalid?: boolean;
  autoFocus?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChange,
  isInvalid = false,
  autoFocus = true,
}) => {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [selection, setSelection] = useState({ start: value.length, end: value.length });

  const otpBorder = useThemeColor({}, "otpBorder");
  const otpBorderActive = useThemeColor({}, "otpBorderActive");
  const otpBorderError = useThemeColor({}, "otpBorderError");
  const otpBackground = useThemeColor({}, "otpBackground");
  const otpText = useThemeColor({}, "otpText");

  const handleChangeText = (text: string) => {
    // Only allow digits
    const cleaned = text.replace(/[^\d]/g, "");
    const newValue = cleaned.slice(0, length);
    onChange(newValue);

    // Update selection to end of input
    const newPosition = newValue.length;
    setSelection({ start: newPosition, end: newPosition });
  };

  const handlePress = (index?: number) => {
    inputRef.current?.focus();

    // On iOS, allow tapping specific digit to edit from that position
    if (Platform.OS === 'ios' && index !== undefined) {
      const position = Math.min(index, value.length);
      setSelection({ start: position, end: position });
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Announce for screen readers
    AccessibilityInfo.announceForAccessibility(
      `OTP input field. ${value.length} of ${length} digits entered${isInvalid ? '. Invalid code' : ''}`
    );
  };

  // Split value into individual digits
  const digits = value.split("");
  while (digits.length < length) {
    digits.push("");
  }

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="none"
      accessibilityLabel={`One-time password input. ${length} digits required. ${value.length} of ${length} entered.`}
      accessibilityHint="Enter the verification code sent to your device"
      accessibilityState={{ disabled: false }}
    >
      {/* Hidden input that captures all text */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={() => setIsFocused(false)}
        keyboardType="number-pad"
        maxLength={length}
        autoFocus={autoFocus}
        style={styles.hiddenInput}
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        selection={selection}
        onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
        accessible={false}
        importantForAccessibility="no"
      />

      {/* Visible boxes */}
      <View style={styles.boxesContainer}>
        {digits.map((digit, index) => {
          const isActive = isFocused && index === value.length;
          const borderColor = isInvalid ? otpBorderError : isActive ? otpBorderActive : otpBorder;

          return (
            <Pressable
              key={index}
              onPress={() => handlePress(index)}
              style={[
                styles.box,
                {
                  borderColor,
                  backgroundColor: otpBackground
                }
              ]}
              accessible={false}
              importantForAccessibility="no"
            >
              <Text style={[styles.digit, { color: otpText }]}>{digit}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 1,
    height: 1,
  },
  boxesContainer: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  box: {
    width: 56,
    height: 56,
    borderWidth: 2,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  digit: {
    fontSize: 24,
    fontWeight: "600",
  },
});
