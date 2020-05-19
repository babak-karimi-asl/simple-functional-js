
const fp = {}
//var fs = require('fs');
var fs = {writeFileSync(fileName,fileContent){alert(fileContent)}}


fp.counter = init=>()=>init++
// BASIC
fp.deepClone = obj=>JSON.parse(JSON.stringify(obj))
fp.compose = (...fns) => x => fns.reduceRight((y, f) => f(y), x);
/*
fp.compose = (...fns) => x => fns.reduceRight((y, f) => {
  console.log('f',f)
  console.log('y',y)
  let result = f(y)
  console.log('result',result)
  return result
}, x);
*/ 
fp.pipe =  (...fns) => x => fns.reduce((y, f) => f(y), x);
fp.assoc = prop=>value=>obj=>{obj[prop]=value; return obj;}
fp.prop = a=>b=>b[a]
fp.stringArrayJoin= j=>a=>a.join(j)
fp.stringToLowerCase = a=>a.toLowerCase()
fp.arraySlice = start=>end=>array=>array.slice(start,end)
fp.arrayFilter = fnc=>arr=>arr.filter(fnc)
fp.objectKeys = a=>fp.list(...Object.keys(a))
fp.arrayFlat = arr=>Array.isArray(arr)?arr.flat(1):fp.Fail('not-array passed to arrayFlat')
fp.arrayFlatDeep = arr=>Array.isArray(arr)?arr.flat(Infinity):fp.Fail('not-array passed to arrayFlatDeep')
fp.jsonParse = a=>{
	try{ let result = JSON.parse(a); return result; }
	catch (e) { return fp.Fail(e); }
}
fp.jsonStringify = a=>{
	try{ let result = JSON.stringify(a); return result; }
	catch (e) { return fp.Fail(e); }
}
const switchcase = cases => defaultCase => key =>cases.hasOwnProperty(key) ? cases[key] : defaultCase
const executeIfFunction = f => typeof(f)==='function' ? f() : f
fp.match = cases => defaultCase => key => executeIfFunction(switchcase(cases)(defaultCase)(key))
fp.typeOf = a=>a._type?a._type:(Array.isArray(a)?'array':typeof(a))
fp.reduce = g=>init=>a=>fp.match({
  'array':()=>a.reduce(g,init)
})('!')( fp.typeOf(a) )
fp.tryIt = func=>onFail=>{
	try{ let result =func(); return result; }
	catch(e) { return onFail(e) }
}
fp.curry=(fn)=>{
  const arity = fn.length
  return function $curry(...args) {
    if (args.length < arity) return $curry.bind(null, ...args)
    return fn.call(null, ...args)
  }
}
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

fp.view = lens=>source=>fp.match({
  'LensPath':()=>lens.path.reduce((acc,cur)=>acc[cur],source)
})('!')(lens._type)

fp.set = lens=>value=>source=>fp.match({
  'LensPath':()=>{
    let tmp = lens.path.pop()
    let ref = lens.path.reduce((acc,cur)=>acc[cur],source)
    ref[tmp]=value
    lens.path.push(tmp)
    return source
  }
})('!')(lens._type)

fp.over = lens=>over=>source=>fp.match({
  'LensPath':()=>{
    let tmp = lens.path.pop()
    let ref = lens.path.reduce((acc,cur)=>acc[cur],source)
    ref[tmp]=over(ref[tmp])
    lens.path.push(tmp)
    return source
  }
})('!')(lens._type)


////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

fp.cataMap = f=>mapper=>xs=>f(mapper(xs)(ys=>fp.cataMap(f)(mapper)(ys)))

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

fp.logToFile = fileName=>obj=>{fs.writeFileSync(fileName, JSON.stringify(obj, null, 4)); return obj; }
fp.trace = what=>value=>{ typeof(what)==='function'?console.log(what(value)):console.log(what,value); return value;}
fp.log = what=>value=>{ console.log(what); return value; }
fp.inspect = a=>{console.dir(a,{depth:null}); return a;}

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

fp.map = g=>a=>fp.match({
  'List':()=>fp.List(a.data.map(g)),
  'array':()=>a.map(g),
  
  'IO':()=> fp.IO((e,n,s)=>a.fork(e,n,fp.compose(s,g))),
  'Fail':()=>a,
  'Null':()=>a,
  'Done':()=>fp.Done(g(a.value)),
})('!')( fp.typeOf(a) )

fp.chain = g=>a=>fp.match({
	'IO':()=>fp.join(fp.map(g)(a)),
	'Fail':()=>a,
    'Null':()=>a,
    'Done':()=>fp.join(fp.map(g)(a)),
})('!')(a._type)

fp.join = a=>fp.match({
	'IO':()=>fp.IO((e,n,s)=>a.fork(e,n,x=>x.fork(e,n,s))),
	'Fail':()=>a,
    'Null':()=>a,
    'Done':()=>a.value,
})('!')(a._type)

fp.ap = ap=>a=>fp.match({
	'IO':()=>fp.chain(fn =>fp.map(fn)(ap))(a),
	'Fail':()=>a,
    'Null':()=>a,
    'Done':()=>fp.map(a.value)(ap),
})('!')(a._type)


fp.of = name=>fp.match({
	'IO':()=>fp.chain(fn =>fp.map(fn)(ap))(a),
	//'Fail':()=>a,
    //'Null':()=>a,
    //'Done':()=>fp.map(a.value)(ap),
})('!')(name)

fp.IOOf = fnc=>fp.IO((e,n,d)=>d(fnc))
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

//appendChild  todoList  domIO.getElementById('root')
//fp.ap( domIO.getElementById('root') )(  fp.map( domIO.appendChild )( todoList )  )

//fp.liftA2 = g=>f1=>f2=> fp.join( fp.ap(f2)(fp.map(g)(f1)) ) ;
fp.liftA2 = fp.curry((g, f1, f2) => fp.join( fp.ap(f2)(fp.map(g)(f1)) ) );
//fp.liftA3 = fp.curry((g, f1, f2, f3) => fp.ap(fp.ap(fp.ap(g)(f1))(f2))(f3));

////////////////////////////////////////////////////////////////////////

fp.LensPath = (...path)=>({
  _type:'LensPath',
  path,
})

fp.Tree = parent=>(...kids)=>({
  _type:'Tree',
  parent,
  kids
})

fp.Fail = err=>({_type:'Fail',err})
fp.Null = ()=>({_type:'Null'})
fp.Done = value=>({_type:'Done',value})

fp.IO = fork=>({
	_type:'IO',
	fork
})


fp.tryIO = func=>fp.IO((e,n,d)=>{ try{let result = func(); d(result); }catch(ee){e(ee);} })

//fp.branch = fp.curry((fail,nall,done,io)=>{})

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

export {fp}
//module.exports = fp

