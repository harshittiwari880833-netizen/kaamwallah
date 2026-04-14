import { memo, useEffect, useMemo, useRef } from 'react';

function OtpInput({ value, onChange, disabled = false }) {
  const inputsRef = useRef([]);
  const digits = useMemo(
    () => Array.from({ length: 6 }, (_, index) => value[index] || ''),
    [value],
  );

  useEffect(() => {
    const firstEmptyIndex = digits.findIndex((digit) => !digit);
    const focusIndex = firstEmptyIndex === -1 ? 5 : firstEmptyIndex;
    inputsRef.current[focusIndex]?.focus();
  }, [digits]);

  function updateDigit(index, nextDigit) {
    const cleanDigit = nextDigit.replace(/\D/g, '').slice(-1);
    const nextValue = digits.map((digit, digitIndex) =>
      digitIndex === index ? cleanDigit : digit,
    );

    onChange(nextValue.join(''));

    if (cleanDigit && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(event, index) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }

    if (event.key === 'ArrowRight' && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handlePaste(event) {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

    if (!pasted) {
      return;
    }

    event.preventDefault();
    onChange(pasted);
  }

  return (
    <div className="flex justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputsRef.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(event) => updateDigit(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(event, index)}
          className="h-14 w-12 rounded-2xl border border-cyan-100 bg-white text-center text-xl font-bold text-slate-900 shadow-soft outline-none transition duration-300 focus:scale-105 focus:border-cyan-300 focus:shadow-[0_0_0_5px_rgba(34,211,238,0.16)] sm:h-16 sm:w-14"
        />
      ))}
    </div>
  );
}

export default memo(OtpInput);
