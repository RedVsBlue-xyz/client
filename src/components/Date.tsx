'use client'


export function DateView({ seconds }: { seconds: number }) {
    let dt = new Date(seconds * 1000);
    const padL = (nr:any, len = 2, chr = `0`) => `${nr}`.padStart(2, chr);
    let dformat = `${
        padL(dt.getMonth()+1)}/${
        padL(dt.getDate())}/${
        dt.getFullYear()} ${
        padL(dt.getHours())}:${
        padL(dt.getMinutes())}:${
        padL(dt.getSeconds())}`;
  return (
    <p className="small-p">
        {dformat}
    </p>

  )
}
