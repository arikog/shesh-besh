export function allWhiteHome(board) {
  for (let i=6; i<24; i++) if (board[i]>0) return false;
  return true;
}
export function getLegalDests(board, fromPt, diceRemaining) {
  const results=[], seen=new Set();
  const home=allWhiteHome(board);
  const uniqueDice=[...new Set(diceRemaining)];
  for (const die of uniqueDice) {
    const to=fromPt-die;
    const key=to<0?'off':to;
    if (seen.has(key)) continue;
    seen.add(key);
    if (to<0) {
      if (!home) continue;
      const isExact=(fromPt-die)===-1;
      const highest=board.reduce((h,v,i)=>(v>0&&i>h?i:h),-1);
      if (isExact||fromPt===highest) results.push({to:-1,die});
      continue;
    }
    if (board[to]<=-2) continue;
    results.push({to,die});
  }
  return results;
}
export function applyMove(board, from, to) {
  const nb=[...board];
  nb[from]--;
  if (to>=0) { if (nb[to]===-1) nb[to]=1; else nb[to]++; }
  return nb;
}
