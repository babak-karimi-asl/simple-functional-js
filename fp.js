
//console.log(span.constructor===fp._Element)
const fp= {}



// BASIC

fp.deepClone = obj=>JSON.parse(JSON.stringify(obj))

fp.compose = (...fns) => x => fns.reduceRight((y, f) => f(y), x);
fp.pipe =  (...fns) => x => fns.reduce((y, f) => f(y), x);

fp.assoc = prop=>value=>obj=>{obj[prop]=value; return obj;}
fp.prop = a=>b=>b[a]

fp.strArrJoin= j=>a=>a.join(j)
fp.strToLowerCase = a=>a.toLowerCase()

fp.objectKeys = a=>fp.list(...Object.keys(a))


const switchcase = cases => defaultCase => key =>cases.hasOwnProperty(key) ? cases[key] : defaultCase
const executeIfFunction = f => typeof(f)==='function' ? f() : f
fp.match = cases => defaultCase => key => executeIfFunction(switchcase(cases)(defaultCase)(key))

fp.concat = a=>b=>fp.match({
  'LensPath':()=>fp.lensPath(...a.path,...b.path)
})('!')(a._type)


fp.map = g=>a=>fp.match({
  'List':()=>fp.List(a.data.map(g)),
	'IO':()=>fp.IO(fp.compose(g,a.doIO)),
})('!')(a._type)

fp.chain = g=>a=>fp.match({
	'IO':()=>fp.join(fp.map(g)(a)),
})('!')(a._type)

fp.join = a=>fp.match({
	'IO':()=>fp.IO(()=>a.doIO().doIO()),
	//'IO':()=>fp.IO(()=>a.doIO()),
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

fp.trace = what=>value=>{console.log(what,value); return value}

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////


fp.IO = g=>({_type:'IO',g,doIO:()=>g()})

fp.Async = fork=>({
	_type:'Async',
	fork
})
/*
fp.io.textChange = lens=>element=>source=>{
  return ()=>{
    document.getElementById(element.id).innerText = fp.view(lens,source)
  }
}

fp.io.inputText = lens=>element=>source=>{
  return (cb)=>{
    document.getElementById(element.id).addEventListener('keydown',e=>cb(fp.set(lens,e.target.value,source)) )
  }
}

fp.io.inputButton = lens=>over=>element=>source=>{

  return (cb)=>{
   document.getElementById(element.id).addEventListener('click',e=>cb(fp.over(lens,over,source)) )
  }

}
 */




//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////
  export {fp}

