import React, { useEffect, useState } from 'react';

// interface TimeProps {
//   date: Date;
// }

const Time = (props) => {
  // const { date } = props;
  const [date, setDate] = useState(props.date);

  useEffect(() => {
    console.log('new Date(props.date)', props.date);
    if (typeof props.date === 'string') {
      setDate(new Date(props.date));
    }
  }, [props.date]);

  console.log('date', date);

  return date ? <time dateTime={date.toISOString()}>{date.toISOString()}</time> : <>loading</>;
};

export default Time;