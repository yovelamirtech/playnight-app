import { useState } from 'react';
import { View } from 'react-native';

import { ChipGrid } from '@/components/ui/ChipGrid';
import { ChoiceChip } from '@/components/ui/ChoiceChip';
import { MOODS } from '@/constants/session';
import { t } from '@/i18n';
import type { CalibrationQuestionId } from '@/lib/calibration/pickQuestion';
import { SAVE_FREQUENCIES, SESSION_LENGTH_BUCKETS, SESSION_STYLES } from '@/lib/calibration/questionValues';
import type { CalibrationAnswerRawValue, Question1AnswerValue } from '@/db/repositories/sessionsRepo';

const QUESTION_1_OPTIONS: Question1AnswerValue[] = ['yes', 'no', 'depends'];
const MOOD_ROWS = [MOODS.slice(0, 3), MOODS.slice(3)];

type OptionRowProps<V extends CalibrationAnswerRawValue> = {
  options: readonly V[];
  labels: Record<V, string>;
  value: CalibrationAnswerRawValue | null;
  onChange: (value: CalibrationAnswerRawValue) => void;
};

function OptionRow<V extends CalibrationAnswerRawValue>({
  options,
  labels,
  value,
  onChange,
}: OptionRowProps<V>) {
  return (
    <View className="flex-row gap-2">
      {options.map((option) => (
        <ChoiceChip
          key={option}
          label={labels[option]}
          selected={value === option}
          onPress={() => onChange(option)}
        />
      ))}
    </View>
  );
}

type CalibrationQuestionProps = {
  questionId: CalibrationQuestionId;
  value: CalibrationAnswerRawValue | null;
  onChange: (value: CalibrationAnswerRawValue) => void;
};

/** מציג את שאלת הכיול הנבחרת (§4.5, "בנק השאלות") ומחזיר ערך גולמי אחד לפי טאפ. */
export function CalibrationQuestion({ questionId, value, onChange }: CalibrationQuestionProps) {
  const [moodListOpen, setMoodListOpen] = useState(value !== null && value !== 'accurate');
  const questions = t.sessionLog.calibrationQuestions;

  if (questionId === 1) {
    return <OptionRow options={QUESTION_1_OPTIONS} labels={questions[1].options} value={value} onChange={onChange} />;
  }
  if (questionId === 2) {
    return (
      <OptionRow options={SESSION_LENGTH_BUCKETS} labels={questions[2].options} value={value} onChange={onChange} />
    );
  }
  if (questionId === 3) {
    return <OptionRow options={SAVE_FREQUENCIES} labels={questions[3].options} value={value} onChange={onChange} />;
  }
  if (questionId === 4) {
    return <OptionRow options={SESSION_STYLES} labels={questions[4].options} value={value} onChange={onChange} />;
  }

  // שאלה #5: כן/לא, ובענף ה"לא" — בחירה מרשימת מצבי הרוח (§4.5).
  return (
    <View className="gap-2">
      <View className="flex-row gap-2">
        <ChoiceChip
          label={questions[5].accurateOption}
          selected={value === 'accurate'}
          onPress={() => {
            setMoodListOpen(false);
            onChange('accurate');
          }}
        />
        <ChoiceChip
          label={questions[5].inaccurateOption}
          selected={moodListOpen}
          onPress={() => setMoodListOpen(true)}
        />
      </View>
      {moodListOpen ? (
        <ChipGrid
          rows={MOOD_ROWS}
          keyFor={(mood) => mood.id}
          gapClassName="gap-2"
          renderItem={(mood) => (
            <ChoiceChip
              label={t.home.moods[mood.id]}
              selected={value === mood.id}
              onPress={() => onChange(mood.id)}
            />
          )}
        />
      ) : null}
    </View>
  );
}
