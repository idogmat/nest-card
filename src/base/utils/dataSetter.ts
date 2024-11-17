function dateSetter(
  date: Date,
  { hours = 0, minutes = 0, seconds = 0 },
) {
  const newDate = new Date(date.getTime());
  newDate.setHours(newDate.getHours() + hours);
  newDate.setMinutes(newDate.getMinutes() + minutes);
  newDate.setSeconds(newDate.getSeconds() + seconds);
  return newDate;
};

export default dateSetter;