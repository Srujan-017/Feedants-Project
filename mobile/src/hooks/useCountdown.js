import { useState, useEffect } from 'react';

function calculate(deadline) {
  if (!deadline) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  const diff = Math.max(0, new Date(deadline).getTime() - Date.now());
  if (diff === 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    expired: false,
  };
}

export function useCountdown(deadline) {
  const [timeLeft, setTimeLeft] = useState(() => calculate(deadline));

  useEffect(() => {
    setTimeLeft(calculate(deadline));
    const id = setInterval(() => setTimeLeft(calculate(deadline)), 1000);
    return () => clearInterval(id);
  }, [deadline]);

  return timeLeft;
}
