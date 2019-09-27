import React, { useState } from 'react';

const formatTimeSegment = segment => segment.toString().padStart(2, 0);

const msToHMS = ms => {
    let seconds = Math.round(ms / 1000);
    let hours = parseInt( seconds / 3600 ); 
    seconds = seconds % 3600;
    let minutes = parseInt( seconds / 60 );
    seconds = seconds % 60;
    return `${formatTimeSegment(hours)}:${formatTimeSegment(minutes)}:${formatTimeSegment(seconds)}`;
}

const getMinutes = ms => {
  let seconds = Math.round(ms / 1000);
  seconds = seconds % 3600;
  let minutes = parseInt( seconds / 60 );
  return minutes;
}

const Stopwatch = () => {
  const [time, setTime] = useState(window.performance.now());
  const limit = 1;

  setInterval(() => setTime(window.performance.now()), 1000);

  return (
    <div className="stopwatch">
      <p className={getMinutes(time) >= limit ? 'overtime' : 'intime'}>
        Time Elapsed: { msToHMS(time) }
      </p>
    </div>
  );
}

export default Stopwatch;