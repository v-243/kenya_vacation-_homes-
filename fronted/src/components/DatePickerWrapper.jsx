import React from 'react';
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import { enGB } from 'date-fns/locale';

registerLocale('enGB', enGB);

const DatePickerWrapper = ({ checkinDate, checkoutDate, onChange, minDate }) => {
  const onDatesChange = (dates) => {
    const [start, end] = dates;
    onChange(start, end);
  };

  return (
    <DatePicker
      selectsRange={true}
      startDate={checkinDate}
      endDate={checkoutDate}
      onChange={onDatesChange}
      minDate={minDate || new Date()}
      monthsShown={2}
      dateFormat="dd/MM/yyyy"
      placeholderText="Select check-in & check-out dates"
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
      wrapperClassName="w-full"
      todayButton="Today"
      locale="enGB"
    />
  );
};

export default DatePickerWrapper;

