
const fp  =  {}

fp.identity = x=>x
fp.IfElse = cond=>todo=>elsee=>value=>cond(value)?todo(value):elsee(value)

fp.pipe =  (...fns) => x => fns.reduce((y, f) => f(y), x);
fp.compose = (...fns) => x => fns.reduceRight((y, f) => f(y), x);

fp.deepClone = obj=>JSON.parse(JSON.stringify(obj))
fp.typeOf = a=>a._type?a._type:(Array.isArray(a)?'array':typeof(a))
fp.assoc = prop=>value=>obj=>{obj[prop]=value; return obj;}
fp.prop = a=>b=>b[a]
fp.joinStringArray = chr=>arr=>arr.join(chr)

const switchcase = cases => defaultCase => key =>cases.hasOwnProperty(key) ? cases[key] : defaultCase
const executeIfFunction = f => typeof(f)==='function' ? f() : f
fp.match = cases => defaultCase => key => executeIfFunction(switchcase(cases)(defaultCase)(key))

fp.IO = fork=>({_type:'IO',fork,chain:b=>fp.IO((e,s)=>fork(e,x => b(x).fork(e,s))), map:f=>fp.IO((e,s)=>fork(e,x =>s(f(x))))})
fp.Fail = reason=>({_type:'Fail',reason,map:f=>reason,chain:b=>reason})

fp.tryIO = func=>fp.IO((e,d)=>{ try{let result = func(); d(result); }catch(ee){e(ee);} })

fp.chain = a=>b=>b.chain(a)
fp.map = a=>b=>b.map(a)

//fp.case = a=>b=>c=>c==a?

fp.trace = what=>value=>{ typeof(what)==='function'?console.log(what(value)):console.log(what,value); return value;}

fp.timeout = fnc=>to=>setTimeout(fnc,to)

fp.unfold = f=>seed=>{
 let arr = [],state=seed,next;
 while (next = f(state)) {
   state = next[1];
   arr.push(next[0]);
 }
 return arr;
}

fp.traverse = of=>iofunc=>arr=>of((e,n,s)=>{	
 try{
	 let callbacks = []
	 for(let a of arr) iofunc(a).fork(e,n,res=>{ callbacks.push(res); if(callbacks.length===arr.length) s(callbacks); } )
 }
 catch(er){e(er)}
})

fp.lift = fnc=>(...firstArgs)=>finalArg=>fp.IO((errorCallback,nullCallback,successCallback)=>{
	try{
		let callbacks = []
		let callbacksLength=firstArgs.length+(finalArg?1:0)
		let resultHandler = res=>{
			 callbacks.push(res); 
			 if(callbacks.length===callbacksLength) {
				 let i = 0,result = fnc
				 while(typeof(result)==='function') result = result(callbacks[i++])
			     result.fork(errorCallback,nullCallback,successCallback)
			 } 
		}
		for(let fa of firstArgs) fa.fork(errorCallback,nullCallback,resultHandler)
		if(finalArg) finalArg.fork(errorCallback,nullCallback,resultHandler)
	} catch(e) { errorCallback(e) }
})
