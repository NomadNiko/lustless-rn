import React, { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

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

  const handleChangeText = (text: string) => {
    // Only allow digits
    const cleaned = text.replace(/[^\d]/g, "");
    onChange(cleaned.slice(0, length));
  };

  const handlePress = () => {
    inputRef.current?.focus();
  };

  // Split value into individual digits
  const digits = value.split("");
  while (digits.length < length) {
    digits.push("");
  }

  return (
    <View style={styles.container}>
      {/* Hidden input that captures all text */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        keyboardType="number-pad"
        maxLength={length}
        autoFocus={autoFocus}
        style={styles.hiddenInput}
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
      />

      {/* Visible boxes */}
      <View style={styles.boxesContainer}>
        {digits.map((digit, index) => (
          <Pressable
            key={index}
            onPress={handlePress}
            style={[
              styles.box,
              isInvalid && styles.boxError,
              isFocused && index === value.length && styles.boxActive,
            ]}
          >
            <Text style={styles.digit}>{digit}</Text>
          </Pressable>
        ))}
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
    borderColor: "#3f3f46",
    borderRadius: 8,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  boxActive: {
    borderColor: "#8b5cf6",
  },
  boxError: {
    borderColor: "#ef4444",
  },
  digit: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "600",
  },
});
