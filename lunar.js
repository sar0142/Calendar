/**
 * 한국 음력 ↔ 양력 변환 라이브러리
 * 1900~2050년 지원
 */

const LUNAR_DATA = [
  [0, 0x04AE53, 1900, 1, 31], [0, 0x0A5748, 1901, 2, 19], [5, 0x5526BD, 1902, 2,  8],
  [0, 0x0D2650, 1903, 1, 29], [0, 0x0D9544, 1904, 2, 16], [4, 0x46AAB9, 1905, 2,  4],
  [0, 0x056A4D, 1906, 1, 25], [2, 0x9AD557, 1907, 2, 13], [0, 0x055B52, 1908, 2,  2],
  [5, 0x04BA5A, 1909, 1, 22], [0, 0x0A5B6A, 1910, 2, 10], [0, 0x0153A5, 1911, 1, 30],
  [4, 0x29471B, 1912, 2, 18], [0, 0x06AA48, 1913, 2,  6], [0, 0x0AD550, 1914, 1, 26],
  [5, 0x55B555, 1915, 2, 14], [0, 0x04BA4A, 1916, 2,  3], [2, 0x0A954F, 1917, 1, 23],
  [0, 0x0D4A4B, 1918, 2, 11], [0, 0x0DA544, 1919, 2,  1], [3, 0x35AA54, 1920, 2, 20],
  [0, 0x056A4F, 1921, 2,  8], [7, 0x96D4A5, 1922, 1, 28], [0, 0x04AE52, 1923, 2, 16],
  [0, 0x0A5B47, 1924, 2,  5], [5, 0x552751, 1925, 1, 24], [0, 0x0D2646, 1926, 2, 13],
  [0, 0x0D5543, 1927, 2,  2], [6, 0x56D537, 1928, 1, 23], [0, 0x02B546, 1929, 2, 10],
  [0, 0x03D54B, 1930, 1, 30], [3, 0x29EA47, 1931, 2, 17], [0, 0x056A4D, 1932, 2,  6],
  [8, 0xAAD5B5, 1933, 1, 26], [0, 0x025D4B, 1934, 2, 14], [0, 0x052B44, 1935, 2,  4],
  [6, 0x5A9557, 1936, 1, 24], [0, 0x056A52, 1937, 2, 11], [0, 0x096D47, 1938, 1, 31],
  [4, 0x54AEB5, 1939, 2, 19], [0, 0x04AD4B, 1940, 2,  8], [2, 0x0A4B4F, 1941, 1, 27],
  [0, 0x0D4A4B, 1942, 2, 15], [0, 0x0D6447, 1943, 2,  5], [6, 0x5D6556, 1944, 1, 25],
  [0, 0x056A4D, 1945, 2, 13], [1, 0x1169B4, 1946, 2,  2], [0, 0x04AE51, 1947, 1, 22],
  [0, 0x0A9547, 1948, 2, 10], [5, 0x5795B5, 1949, 1, 29], [0, 0x06CA4C, 1950, 2, 17],
  [0, 0x0AD544, 1951, 2,  6], [9, 0x55B4B8, 1952, 1, 27], [0, 0x055B4D, 1953, 2, 14],
  [0, 0x04BA52, 1954, 2,  3], [7, 0x0A5B46, 1955, 1, 24], [0, 0x0154B5, 1956, 2, 12],
  [3, 0x35294B, 1957, 1, 31], [0, 0x06AA4F, 1958, 2, 18], [0, 0x0AD548, 1959, 2,  8],
  [4, 0x56B554, 1960, 1, 28], [0, 0x04B64C, 1961, 2, 15], [0, 0x0A574E, 1962, 2,  5],
  [3, 0x552E5D, 1963, 1, 25], [0, 0x0D264A, 1964, 2, 13], [8, 0x5D9553, 1965, 2,  2],
  [0, 0x05AA4F, 1966, 1, 21], [0, 0x056A45, 1967, 2,  9], [6, 0x596D4C, 1968, 1, 30],
  [0, 0x04AE52, 1969, 2, 17], [0, 0x0A5B46, 1970, 2,  6], [5, 0x5526E5, 1971, 1, 27],
  [0, 0x0D2648, 1972, 2, 15], [0, 0x0D5545, 1973, 2,  3], [3, 0x36AABB, 1974, 1, 23],
  [0, 0x056A50, 1975, 2, 11], [7, 0xB4AADF, 1976, 1, 31], [0, 0x025D4A, 1977, 2, 18],
  [0, 0x092B47, 1978, 2,  7], [6, 0x5A954D, 1979, 1, 28], [0, 0x056A4B, 1980, 2, 16],
  [2, 0x0A6D41, 1981, 2,  5], [0, 0x0ADAB6, 1982, 1, 25], [0, 0x0AB549, 1983, 2, 13],
  [5, 0x4DA54D, 1984, 2,  2], [0, 0x0D2A52, 1985, 2, 20], [0, 0x0D6A46, 1986, 2,  9],
  [8, 0x55AABD, 1987, 1, 29], [0, 0x056A51, 1988, 2, 17], [0, 0x096D46, 1989, 2,  6],
  [6, 0x54AEBB, 1990, 1, 27], [0, 0x04AD50, 1991, 2, 15], [0, 0x0A4D47, 1992, 2,  4],
  [3, 0x3D26BF, 1993, 1, 23], [0, 0x0D554A, 1994, 2, 10], [8, 0x5D6A57, 1995, 1, 31],
  [0, 0x056A4C, 1996, 2, 19], [0, 0x096D42, 1997, 2,  7], [5, 0x54AEBF, 1998, 1, 28],
  [0, 0x04AE53, 1999, 2, 16], [0, 0x0A5B4A, 2000, 2,  5], [4, 0x552752, 2001, 1, 24],
  [0, 0x0D264F, 2002, 2, 12], [0, 0x0D5545, 2003, 2,  1], [2, 0x25AAB9, 2004, 1, 22],
  [0, 0x056A4E, 2005, 2,  9], [7, 0xAAD4B4, 2006, 1, 29], [0, 0x025D4B, 2007, 2, 18],
  [0, 0x052B42, 2008, 2,  7], [5, 0x5A9557, 2009, 1, 26], [0, 0x056A4D, 2010, 2, 14],
  [1, 0x096D42, 2011, 2,  3], [0, 0x04AE56, 2012, 1, 23], [0, 0x0A5B4B, 2013, 2, 10],
  [4, 0x552B54, 2014, 1, 31], [0, 0x0D2650, 2015, 2, 19], [0, 0x0D5545, 2016, 2,  8],
  [2, 0x25AAB9, 2017, 1, 28], [0, 0x056A4D, 2018, 2, 16], [6, 0xAAD4B2, 2019, 2,  5],
  [0, 0x025D48, 2020, 1, 25], [0, 0x092B4C, 2021, 2, 12], [4, 0x4A9551, 2022, 2,  1],
  [0, 0x0D2A47, 2023, 1, 22], [0, 0x0D6A4C, 2024, 2, 10], [6, 0x55AABD, 2025, 1, 29],
  [0, 0x056A51, 2026, 2, 17], [0, 0x096D46, 2027, 2,  6], [4, 0x54AEBB, 2028, 1, 26],
  [0, 0x04AD4F, 2029, 2, 13], [0, 0x0A4D43, 2030, 2,  3], [3, 0x3D26BF, 2031, 1, 23],
  [0, 0x0D554B, 2032, 2, 11], [7, 0x5D6A57, 2033, 1, 31], [0, 0x056A4C, 2034, 2, 19],
  [0, 0x096D42, 2035, 2,  8], [5, 0x54AEBF, 2036, 1, 28], [0, 0x04AE53, 2037, 2, 15],
  [0, 0x0A5B48, 2038, 2,  4], [2, 0x552757, 2039, 1, 24], [0, 0x0D264B, 2040, 2, 12],
  [0, 0x0D5550, 2041, 2,  1], [8, 0x55AAB5, 2042, 1, 22], [0, 0x056A4C, 2043, 2, 10],
  [0, 0x096D42, 2044, 1, 30], [6, 0xB4AEBB, 2045, 2, 17], [0, 0x0A4E4F, 2046, 2,  6],
  [0, 0x0D2646, 2047, 1, 26], [5, 0x5EA54B, 2048, 2, 14], [0, 0x06AA50, 2049, 2,  2],
  [0, 0x0AD547, 2050, 1, 23],
];

function getLunarYearIndex(year) {
  for (let i = 0; i < LUNAR_DATA.length; i++) {
    if (LUNAR_DATA[i][2] === year) return i;
  }
  return -1;
}

function getMonthDays(hexData, month) {
  return (hexData >> (23 - month)) & 1 ? 30 : 29;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** 음력 → 양력 변환 */
function lunarToSolar(lunarYear, lunarMonth, lunarDay, isLeap = false) {
  const idx = getLunarYearIndex(lunarYear);
  if (idx < 0) return null;
  const [leapMonth, hexData, solYear, solMonth, solDay] = LUNAR_DATA[idx];
  let date = new Date(solYear, solMonth - 1, solDay);
  for (let m = 1; m < lunarMonth; m++) {
    date = addDays(date, getMonthDays(hexData, m));
    if (leapMonth === m) date = addDays(date, getMonthDays(hexData, 13));
  }
  if (isLeap && leapMonth === lunarMonth) {
    date = addDays(date, getMonthDays(hexData, lunarMonth));
  }
  date = addDays(date, lunarDay - 1);
  return date;
}

/** 음력 생일 → 향후 N년 양력 날짜 목록 */
function getLunarBirthdayDates(lunarMonth, lunarDay, isLeap, startYear, count = 10) {
  const results = [];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let y = startYear; y < startYear + count + 5 && results.length < count; y++) {
    const solar = lunarToSolar(y, lunarMonth, lunarDay, isLeap);
    if (!solar) continue;
    const dday = Math.ceil((solar - today) / (1000 * 60 * 60 * 24));
    results.push({ lunarYear: y, solar, dday, solarStr: formatDate(solar) });
  }
  return results;
}

/** 양력 생일 → 향후 N년 날짜 목록 */
function getSolarBirthdayDates(month, day, startYear, count = 10) {
  const results = [];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let y = startYear; results.length < count; y++) {
    const solar = new Date(y, month - 1, day);
    const dday = Math.ceil((solar - today) / (1000 * 60 * 60 * 24));
    results.push({ lunarYear: y, solar, dday, solarStr: formatDate(solar) });
  }
  return results;
}

/** 음력/양력 통합 생일 날짜 조회 */
function getBirthdayDates(person, startYear, count = 10) {
  if (person.isLunar) {
    return getLunarBirthdayDates(person.month, person.day, person.isLeap, startYear, count);
  }
  return getSolarBirthdayDates(person.month, person.day, startYear, count);
}

/** 날짜 포맷 */
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const dow = ['일','월','화','수','목','금','토'][date.getDay()];
  return `${y}년 ${m}월 ${d}일 (${dow})`;
}

function formatDateShort(date) {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const dow = ['일','월','화','수','목','금','토'][date.getDay()];
  return `${m}월 ${d}일 (${dow})`;
}

function getDdayStr(dday) {
  if (dday === 0) return 'D-Day 🎉';
  if (dday > 0)  return `D-${dday}`;
  return `D+${Math.abs(dday)}`;
}
