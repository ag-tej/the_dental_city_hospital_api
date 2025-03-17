function convertToMinutes(timeStr) {
  const [hour, minute] = timeStr.split(":").map(Number);
  return hour * 60 + minute;
}

function convertToTimeStr(minutes) {
  const totalMinutes = Number(minutes);
  let hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  const AmPm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12; // Convert to 12hr time format
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(
    2,
    "0"
  )} ${AmPm}`;
}

function generateSlots(startTime, endTime, duration) {
  const slots = [];
  const start = convertToMinutes(startTime);
  const end = convertToMinutes(endTime);
  const session = Number(duration);
  let current = start;
  while (current + session <= end) {
    const slotStart = convertToTimeStr(current);
    const slotEnd = convertToTimeStr(current + session);
    slots.push({ startTime: slotStart, endTime: slotEnd });
    current += session;
  }
  return slots;
}

export { generateSlots, convertToMinutes, convertToTimeStr };
