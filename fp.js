
//console.log(span.constructor===fp._Element)
const fp= {}



// BASIC

fp.deepClone = obj=>JSON.parse(JSON.stringify(obj))

fp.compose = (...fns) => x => fns.reduceRight((y, f) => f(y), x);
fp.pipe =  (...fns) => x => fns.reduce((y, f) => f(y), x);

fp.assoc = prop=>value=>obj=>{obj[prop]=value; return obj;}
fp.prop = a=>b=>b[a]


fp.stringArrayJoin= j=>a=>a.join(j)
fp.stringToLowerCase = a=>a.toLowerCase()
fp.arraySlice = start=>end=>array=>array.slice(start,end)
fp.arrayFilter = fnc=>arr=>arr.filter(fnc)
fp.objectKeys = a=>fp.list(...Object.keys(a))
fp.arrayFlat = arr=>Array.isArray(arr)?arr.flat(1):fp.Nothing('not-array passed to arrayFlat')
fp.arrayFlatDeep = arr=>Array.isArray(arr)?arr.flat(Infinity):fp.Nothing('not-array passed to arrayFlatDeep')
fp.jsonParse = a=>{
	try{ let result = JSON.parse(a); return result; }
	catch (e) { return fp.Nothing(e); }
}
fp.jsonStringify = a=>{
	try{ let result = JSON.stringify(a); return result; }
	catch (e) { return fp.Nothing(e); }
}

const switchcase = cases => defaultCase => key =>cases.hasOwnProperty(key) ? cases[key] : defaultCase
const executeIfFunction = f => typeof(f)==='function' ? f() : f
fp.match = cases => defaultCase => key => executeIfFunction(switchcase(cases)(defaultCase)(key))

fp.typeOf = a=>a._type?a._type:(Array.isArray(a)?'array':typeof(a))

fp.concat = a=>b=>fp.match({
  'LensPath':()=>fp.lensPath(...a.path,...b.path)
})('!')(a._type)


fp.reduce = g=>init=>a=>fp.match({
  'array':()=>a.reduce(g,init)
})('!')( fp.typeOf(a) )

fp.map = g=>a=>fp.match({
  'List':()=>fp.List(a.data.map(g)),
  'IO':()=>fp.IO(fp.compose(g,a.doIO)),
  'Maybe':()=>fp.isNothing(a)?a:fp.Maybe(g(a.value)),
  'Nothing':()=>a,
  'array':()=>a.map(g)
})('!')( fp.typeOf(a) )

fp.chain = g=>a=>fp.match({
	'IO':()=>fp.join(fp.map(g)(a)),
	'Maybe':()=>fp.join(fp.map(g)(a)),
	'Nothing':()=>a,
})('!')(a._type)

fp.join = a=>fp.match({
	'IO':()=>fp.IO(()=>a.doIO().doIO()),
	'Maybe':()=>fp.isNothing(a)?a:a.value,
	'Nothing':()=>a,
})('!')(a._type)

// OPTIC

fp.LensPath = (...path)=>({
  _type:'LensPath',
  path,
})

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



fp.Tree = parent=>(...kids)=>({
  _type:'Tree',
  parent,
  kids
})


fp.cataMap = f=>mapper=>xs=>f(mapper(xs)(ys=>fp.cataMap(f)(mapper)(ys)))



fp.List = (...data)=>({
	_type:'List',
  data
})

fp.trace = what=>value=>{console.log(what,value); return value;}
fp.log = what=>value=>{ console.log(what); return value; }
fp.inspect = a=>{console.dir(a,{depth:null}); return a;}
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

fp.Maybe = value=>({_type:'Maybe',value})
fp.Nothing = value=>({_type:'Nothing',value})
fp.Just = value=>({_type:'Just',value})

fp.maybe = err=>nall=>succ=>may=>{
	if(may && !may._type) return may;
    if(may._type!=='Maybe' && may._type!=='Nothing' && may._type!=='Just') return may;
    if(may===null || may===undefined) return fp.Nothing();
	if(fp._isValueNull(may)) return nall?executeIfFunction(nall):may;
	if(may._type==='Nothing') return err?err(may.value):may;
	return succ?succ(may.value):may;
}

fp._isValueNull = maybe=>(maybe.value===null || maybe.value===undefined);
fp.isNothing = maybe=>(maybe._type==='Nothing' || fp._isValueNull(maybe));



fp.IO = g=>({_type:'IO',g,doIO:()=>g()})

fp.Async = fork=>({
	_type:'Async',
	fork
})



//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////
  //export {fp}
  module.exports = fp

