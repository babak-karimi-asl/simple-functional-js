

// functional part
const fp = {}
fp.pipe =  (...fns) => x => fns.reduce((y, f) => f(y), x);
fp.compose = (...fns) => x => fns.reduceRight((y, f) => f(y), x);
fp.Fail = err=>({_type:'Fail',err})
fp.Null = ()=>({_type:'Null'})
fp.Done = value=>({_type:'Done',value})
fp.IO = fork=>({_type:'IO',fork})
const switchcase = cases => defaultCase => key =>cases.hasOwnProperty(key) ? cases[key] : defaultCase
const executeIfFunction = f => typeof(f)==='function' ? f() : f
fp.match = cases => defaultCase => key => executeIfFunction(switchcase(cases)(defaultCase)(key))
fp.typeOf = a=>a._type?a._type:(Array.isArray(a)?'array':typeof(a))
fp.map = g=>a=>fp.match({
  'IO':()=> fp.IO((e,n,s)=>a.fork(e,n,fp.compose(s,g))),
  'Fail':()=>a,
  'Null':()=>a,
  'Done':()=>fp.Done(g(a.value)),
})('!')( fp.typeOf(a) )
fp.chain = g=>a=>fp.match({
	'IO':()=>fp.IO((e,n,s)=>a.fork(e,n, x => g(x).fork(e,n,s))),
	'Fail':()=>a,
    'Null':()=>a,
    'Done':()=>fp.join(fp.map(g)(a)),
})('!')(a._type)
fp.join = a=>fp.match({
	'IO':()=>fp.chain(x=>x)(a),
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
fp.lift = fnc=>(...firstArgs)=>finalArg=>fp.IO((errorCallback,nullCallback,successCallback)=>{
	try{
		let promises = []
		for(let fa of firstArgs) promises.push(new Promise((res,rej)=>fa.fork(rej,rej,res)))
		promises.push(new Promise((res,rej)=>finalArg.fork(rej,rej,res)))
		Promise.all(promises).then(values=> {
			let i = 0,result = fnc
			while(typeof(result)==='function') result = result(values[i++])
			successCallback( result ) 
		}).catch(errorCallback) 
	} catch(e) { errorCallback(e) }
})


/*
{
_type:IO
fork:{_type:IO,fork}
}
*/




//IO part
const requestForServer = base=>path=>data=>fp.IO( 
	(errorCallback,nullCallback,successCallback)=>{
		  /*
		  fetch(base+path, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify(data),
		  }).then(response => response.json())
			.then( successCallback )
			.catch(errorCallback);
	      */
	      setTimeout(_=>{
			  console.log('>>> requested >>>',data)
			  //console.log(`response from server for path ${base}${path}`)
	          //if(Math.random()>0.5) 
	          successCallback(`<<< response  <<< ${base}${path}`)
	          //else  errorCallback(`<<<   ERROR   <<< ${base}${path}`)
		  },2000)
	}
)



// api part
requestBase = requestForServer('http://cyject.ir:3000/')
roomsList = requestBase('/rooms')
messagesList = requestBase('/messages')
graphQLEndPoint = requestBase('/graphql')




// handlers

const getRoomsAndMessages = rooms=>messages1=>messages2=>messages3=>{
	console.log('!!! got rooms     !!!',rooms)
	console.log('!!! got messages1 !!!',messages1)
	console.log('!!! got messages2 !!!',messages2)
	console.log('!!! got messages3 !!!',messages3)
	return {result:'of function'}
}



//getRoomsAndMessages(111)(222)(333)(444)

//getRoomsAndMessages.apply(null

//const liftRoomsMessages = fp.liftA2(getRoomsAndMessages) (roomsList({rooms:1})) (messagesList({messages:1}))



const parallellArgs = fp.lift(getRoomsAndMessages) 
                    ( roomsList({rooms:1}),messagesList({messages:1}),messagesList({messages:2}) )
                    ( messagesList({messages:3}) )



let apiCall = ()=>{
	parallellArgs.fork(
		error=>{ setTimeout(apiCall,1000); console.log('error',error) },
		_=>console.log('null returned'),
		success=>console.log('success >>> ',success)
	)
}


//apiCall()

//lift(getRoomsAndMessages) ( roomsList({rooms:1}),messagesList({messages:1}) )


const partialParrallelArgs = fp.lift(getRoomsAndMessages) ( roomsList({rooms:1}),messagesList({messages:1}),messagesList({messages:2}) )

const api2 = fp.compose(
	//parallellArgs,
	fp.chain(roomsList),
	fp.chain(messagesList),
	roomsList,
)

api2({hello:'world'}).fork(
	error=>console.log('error2',error),
	_=>console.log('null2'),
	success=>console.log('success2',success)
)


/*
const sequentialRequests = fp.pipe(
messagesList,
fp.chain ( roomsList )
)
*/

//const data1 = {rooms:[1,2,3]}

//console.log(liftRoomsMessages)

/*
liftRoomsMessages.fork(
error=>console.log('error',error),
_=>console.log('null'),
success=>console.log('success',success)
)
*/

//setInterval(()=>console.log('0.5s...'),500)

/*
const promise1 = Promise.resolve(3);
const promise2 = 42;

const promise1 = new Promise((resolve, reject) =>setTimeout(resolve, 1000, 'foo1') );
const promise2 = new Promise((resolve, reject) =>setTimeout(resolve, 1000, 'foo2') );
const promise3 = new Promise((resolve, reject) =>setTimeout(resolve, 1000, 'foo3') );
Promise.all([promise1, promise2, promise3]).then((values) => {
  console.log(values);
});
*/


/*
requestForServer('base')('path')('data').fork(
error=>console.log('error',error),
_=>console.log('null'),
success=>console.log('success',success)
)

requestForServer('base')('path')('data').fork(
error=>console.log('error',error),
_=>console.log('null'),
success=>console.log('success',success)
)
*/










