import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { LiveEstimate } from '@/components/quiz/LiveEstimate'
import { ProgressBar } from '@/components/quiz/ProgressBar'
import { ResultScreen } from '@/components/quiz/ResultScreen'
import { StepOptions } from '@/components/quiz/StepOptions'
import { Button } from '@/components/ui/Button'
import { QUIZ_STEPS } from '@/data/quizSteps'
import { useQuizStore } from '@/store/quizStore'

export function QuizShell() {
  const {
    currentStepIndex,
    answers,
    total,
    setAnswer,
    nextStep,
    prevStep,
    canGoNext,
    progressPercent,
    isResultStep,
    questionCount,
  } = useQuizStore()

  const step = QUIZ_STEPS[currentStepIndex]
  const onResult = isResultStep()
  const valid = canGoNext()
  const hasAnswers = Object.keys(answers).some((key) => {
    const value = answers[key]
    return Array.isArray(value) ? value.length > 0 : Boolean(value)
  })
  const progressLabel = onResult
    ? 'Шаг 3 из 3 · расчёт готов'
    : `Шаг ${currentStepIndex + 1} из ${questionCount}`

  const handleNext = () => {
    nextStep()
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && valid && !onResult) {
      e.preventDefault()
      handleNext()
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6 sm:py-10" onKeyDown={handleKeyDown}>
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--color-ink)] sm:text-4xl">
            PackSmart
          </p>
          <p className="mt-1 text-sm text-[var(--color-muted)] sm:text-base">
            Умный подбор упаковки за 3 шага
          </p>
        </div>
        <Link
          to="/admin"
          className="rounded-lg px-3 py-2 text-sm text-[var(--color-muted)] transition hover:bg-black/5 hover:text-[var(--color-ink)]"
        >
          Админ
        </Link>
      </header>

      <div className="mb-8 rounded-2xl border border-[var(--color-line)] bg-white/50 p-4 backdrop-blur-sm sm:p-5">
        <ProgressBar percent={progressPercent()} label={progressLabel} />
        {!onResult ? <LiveEstimate total={total} visible={hasAnswers && total > 0} /> : null}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={onResult ? 'result' : step?.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -18 }}
          transition={{ duration: 0.28 }}
        >
          {onResult || !step ? (
            <ResultScreen />
          ) : (
            <StepOptions
              step={step}
              value={answers[step.id]}
              onSelect={(optionId) => setAnswer(step.id, optionId, step.multiSelect)}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {!onResult ? (
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {currentStepIndex > 0 ? (
              <Button variant="secondary" onClick={prevStep}>
                <ArrowLeft size={16} />
                Назад
              </Button>
            ) : (
              <span />
            )}
          </div>
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            {!valid ? (
              <p className="text-sm text-[var(--color-warn)]">
                {step?.requireOneOf
                  ? 'Выберите обязательный вариант (объём или срок), чтобы продолжить'
                  : 'Выберите вариант, чтобы продолжить'}
              </p>
            ) : null}
            <Button onClick={handleNext} disabled={!valid}>
              {currentStepIndex === questionCount - 1 ? 'Рассчитать' : 'Далее'}
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <Button variant="secondary" onClick={prevStep}>
            <ArrowLeft size={16} />
            Изменить ответы
          </Button>
        </div>
      )}
    </div>
  )
}
