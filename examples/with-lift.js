import { fp }  from './js/fp2.js'
import 'bulma/css/bulma.min.css'



const domIO = {}
domIO.getElementById = id=>fp.tryIO(()=>document.getElementById(id))
domIO.setAttribute = attribute=>value=>elem=>fp.tryIO(()=>{elem.setAttribute(attribute,value); return elem; })
domIO.setValue = key=>value=>elem=>fp.tryIO(()=>{elem[key]=value; return elem;})
domIO.createElement = tag=>classString=>id=>fp.tryIO(()=>{
	const d = document.createElement(tag)
	d.setAttribute('class',classString)
	d.id = id
	return d
})
domIO.appendChild = child=>parent=>fp.tryIO(()=>(parent.appendChild(child),parent))


//domIO.LensOverId = over=>id=>elem=>fp.tryIO(()=>fp.compose( fp.chain(over),fp.tryIO(()=>elem.getElementById(id)) )({}))
/*
const createList = fp.curry((list,input)=>{
	console.log('list is',list)
	console.log('input is',input)
	return 'hoooray!'
})
const apRez = fp.ap(  fp.IOOf(a=>a+'3333')  ) (  fp.IOOf(()=>'firstIO')  )
console.log(apRez)

apRez.fork(
	(e)=>console.log('ERROR>>>>>>>>>',e),
	()=>console.log('NULL>>>>>>>>'),
	d=>console.log('DONE!>>>>>>>>',d),
)
*/

const todoList = domIO.createElement('div')('container')('todo-list')
const todoInput = domIO.createElement('input')('input')('todo-input')
const appender = fp.liftA2( domIO.appendChild )
const appendToDoList = appender(todoList)
const appendToDoInupt = appender(todoInput)

const todoListCreate = fp.compose(
appendToDoInupt,
appendToDoList,
domIO.getElementById,
)('root')

//let result = fp.liftA2( domIO.appendChild,todoList,domIO.getElementById('root')  )
todoListCreate.fork(
	(e)=>console.log('ERROR>>>>>>>>>',e),
	()=>console.log('NULL>>>>>>>>'),
	d=>console.log('DONEEEEE!>>>>>>>>',d)
)





//fp.apply( domIO.appendChild ) ( fp.concat(todoList,domIO.getElementById('root'))  )
/*
Container.of(add(2)).ap(Container.of(3));
Container.of(2).map(add).ap(Container.of(3));

Container.of(2)
         todoList

     .map(add)
         domIO.appendChild

     .ap(Container.of(3));
         domIO.getElementById('root')
*/


//let result = fp.ap( domIO.getElementById('root') )(  fp.map( domIO.appendChild )( todoList )  )
//result = fp.join(result)




/*
const appRes = domIO.appendChild ( todoList ) ( domIO.getElementById('root') )
appRes.fork(
	(e)=>console.log('ERROR>>>>>>>>>',e),
	()=>console.log('NULL>>>>>>>>'),
	d=>console.log('DONE!>>>>>>>>',d)
)
*/


//fp.liftA2( domIO.appendChild, todoList , domIO.getElementById('root') )


/*
const createResult = fp.compose(
domIO.appendChild
domIO.LensOverId()('input'),
domIO.getElementById
)('root')
*/
//const liftResult = fp.liftA2( fp.IOOf(createList),todoList,todoInput )
//console.log('liftResult',liftResult)


/*
liftResult.fork(
	(e)=>console.log('ERROR>>>>>>>>>',e),
	()=>console.log('NULL>>>>>>>>'),
	d=>console.log('DONE!>>>>>>>>',d),
)
*/
/*



todoListCreate.fork(
	(e)=>console.log('ERROR>>>>>>>>>',e),
	()=>console.log('NULL>>>>>>>>'),
	d=>console.log('DONE!>>>>>>>>',d),
)
*/
/*
const result = fp.compose(
//fp.trace('betweeb'),
fp.map( fp.prop('id') ),
fp.chain( domIO.setAttribute('class')('hello there 2') ),
fp.chain( domIO.setAttribute('class')('hello there') ),
domIO.getElementById,
)('root')

result.fork(
	(e)=>console.log('ERROR>>>>>>>>>',e),
	()=>console.log('NULL>>>>>>>>'),
	d=>console.log('DONE!>>>>>>>>',d),
)
*/


