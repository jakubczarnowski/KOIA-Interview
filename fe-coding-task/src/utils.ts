import { eachQuarterOfInterval } from "date-fns";

export const generateQuarters = ({
  startDate,
  endDate,
}: {
  startDate: Date;
  endDate: Date;
}) => {
  const quarters = eachQuarterOfInterval({
    start: startDate,
    end: endDate,
  });
  return quarters.map((quarter) => {
    const year = quarter.getFullYear();
    const quarterNumber = Math.floor(quarter.getMonth() / 3) + 1;
    return `${year}K${quarterNumber}`;
  });
};

export const parseQuaterValueToDate = (quarter: string) => {
  const [year, quarterNumber] = quarter.split("K");
  const month = parseInt(quarterNumber) * 3 - 2;
  return new Date(Number(year), month);
};

export function saveToLocalStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getFromLocalStorage<T>(key: string): T | null {
  const storedValue = localStorage.getItem(key);
  return storedValue ? JSON.parse(storedValue) : null;
}

export function saveToURLParams<T>(key: string, value: T): void {
  const params = new URLSearchParams(window.location.search);
  params.set(key, JSON.stringify(value));
  const newURL = window.location.pathname + "?" + params.toString();
  window.history.pushState({}, "", newURL);
}

export function getFromURLParams<T>(key: string): T | null {
  const params = new URLSearchParams(window.location.search);
  const value = params.get(key);
  return value ? JSON.parse(value) : null;
}
