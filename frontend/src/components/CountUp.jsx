import { useEffect, useState } from "react";

function CountUp({ value = 0, duration = 1200, suffix = "" }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame;
    const startTime = performance.now();

    const step = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      setDisplay(Math.floor(progress * Number(value || 0)));
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return (
    <span>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

export default CountUp;
