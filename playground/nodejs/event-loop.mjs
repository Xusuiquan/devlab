console.log('sync: start');

// 0ms 不代表立即执行；这里只注册定时器，回调稍后执行。
setTimeout(() => {
  console.log('timeout: callback');
}, 0);

// 即使注册在定时器之后，已兑现 Promise 的 then 回调仍作为微任务调度。
Promise.resolve().then(() => {
  console.log('promise: microtask');
});

console.log('sync: end');
