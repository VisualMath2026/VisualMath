import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type SelfCheckOption = {
  id: string;
  text: string;
};

type SelfCheckBlockProps = {
  title: string;
  question: string;
  options: SelfCheckOption[];
  correctOptionId: string;
  explanation?: string;
};

export function SelfCheckBlock({
  title,
  question,
  options,
  correctOptionId,
  explanation,
}: SelfCheckBlockProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const selectedOption = useMemo(
    () => options.find((option) => option.id === selectedOptionId) ?? null,
    [options, selectedOptionId],
  );

  const isCorrect = selectedOption?.id === correctOptionId;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.question}>{question}</Text>

      <View style={styles.optionsWrap}>
        {options.map((option) => {
          const isSelected = option.id === selectedOptionId;
          const showCorrect =
            isSubmitted && option.id === correctOptionId;
          const showWrong =
            isSubmitted && isSelected && option.id !== correctOptionId;

          return (
            <Pressable
              key={option.id}
              onPress={() => {
                setSelectedOptionId(option.id);
                setIsSubmitted(false);
              }}
              style={[
                styles.optionButton,
                isSelected && styles.optionButtonSelected,
                showCorrect && styles.optionButtonCorrect,
                showWrong && styles.optionButtonWrong,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                  showCorrect && styles.optionTextCorrect,
                  showWrong && styles.optionTextWrong,
                ]}
              >
                {option.text}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={() => {
          if (selectedOptionId) {
            setIsSubmitted(true);
          }
        }}
        style={[
          styles.submitButton,
          !selectedOptionId && styles.submitButtonDisabled,
        ]}
      >
        <Text style={styles.submitButtonText}>Проверить ответ</Text>
      </Pressable>

      {isSubmitted ? (
        <View
          style={[
            styles.resultBox,
            isCorrect ? styles.resultBoxCorrect : styles.resultBoxWrong,
          ]}
        >
          <Text
            style={[
              styles.resultTitle,
              isCorrect ? styles.resultTitleCorrect : styles.resultTitleWrong,
            ]}
          >
            {isCorrect ? "Верно" : "Нужно попробовать ещё раз"}
          </Text>

          {selectedOption ? (
            <Text style={styles.resultText}>
              Твой ответ: {selectedOption.text}
            </Text>
          ) : null}

          {explanation ? (
            <Text style={styles.resultExplanation}>{explanation}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export default SelfCheckBlock;

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#d0d5dd",
    backgroundColor: "#ffffff",
    padding: 14,
    marginBottom: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#101828",
    marginBottom: 8,
  },
  question: {
    fontSize: 15,
    lineHeight: 22,
    color: "#344054",
    marginBottom: 12,
  },
  optionsWrap: {
    marginBottom: 12,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: "#d0d5dd",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    marginBottom: 8,
  },
  optionButtonSelected: {
    borderColor: "#0f172a",
    backgroundColor: "#f8fafc",
  },
  optionButtonCorrect: {
    borderColor: "#15803d",
    backgroundColor: "#f0fdf4",
  },
  optionButtonWrong: {
    borderColor: "#b42318",
    backgroundColor: "#fef3f2",
  },
  optionText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#344054",
  },
  optionTextSelected: {
    color: "#101828",
    fontWeight: "600",
  },
  optionTextCorrect: {
    color: "#166534",
    fontWeight: "700",
  },
  optionTextWrong: {
    color: "#b42318",
    fontWeight: "700",
  },
  submitButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#0f172a",
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
  resultBox: {
    marginTop: 12,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
  },
  resultBoxCorrect: {
    borderColor: "#86efac",
    backgroundColor: "#f0fdf4",
  },
  resultBoxWrong: {
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },
  resultTitleCorrect: {
    color: "#166534",
  },
  resultTitleWrong: {
    color: "#b42318",
  },
  resultText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#344054",
    marginBottom: 6,
  },
  resultExplanation: {
    fontSize: 14,
    lineHeight: 20,
    color: "#475467",
  },
});