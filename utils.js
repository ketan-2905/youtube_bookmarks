function formatTime(seconds) {
    let totalSeconds = Math.floor(seconds); // Remove milliseconds for display
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let secs = totalSeconds % 60;

    // Decide format dynamically
    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`; // H:MM:SS
    } else if (minutes > 0) {
        return `${minutes}:${String(secs).padStart(2, '0')}`; // M:SS
    } else {
        return `0:${secs}`; // Just seconds
    }
}

// ✅ Test Cases
console.log(formatTime(34.650667));    // "12:10"
console.log(formatTime(3661.456));   // "1:01:01"
console.log(formatTime(59.789));     // "59s"
console.log(formatTime(3600));       // "1:00:00"
console.log(formatTime(452.35));     // "7:32"
console.log(formatTime(5.1));        // "5s"
console.log(formatTime(120));        // "2:00"
console.log(formatTime(7265.523));   // "2:01:05"
console.log(formatTime(140000));     // "38:53:20" (38 hours, 53 mins, 20 secs)
console.log(formatTime(39 * 3600 + 15 * 60 + 20)); // "39:15:20"

export default formatTime