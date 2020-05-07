import { fp }  from './js/fdom.js'



const domIO = {}
domIO.getElementById = id=>fp.IO(()=>document.getElementById(id))
domIO.setAttribute = attribute=>value=>elem=>fp.IO(()=>{elem.setAttribute(attribute,value); return elem; })
domIO.setValue = key=>value=>elem=>fp.IO(()=>{elem[key]=value; return elem;})



const state = {
   title:'app-titlw',
}

const setTextContentById = id=>lens=>state=>fp.compose(
  fp.chain( domIO.setValue('textContent')(fp.view(lens)(state)) ),
	fp.chain( domIO.setAttribute('style')('background-color:red;') ),
	domIO.getElementById
)(id)


const setTitle = setTextContentById('root')(fp.LensPath('title'))




const onButton = fp.Async(rej=>res=>{
	document.getElementById('root').addEventListener('click',e=>{res(e.target)})
})

console.log(onButton)

onButton.fork(e=>console.log('error',e))
             (r=>console.log('success',r))




const IOList = fp.List(setTitle)
//let aa = [setTitle]

//console.log(aa,IOList.data)
//IOList.data.map(a=>a.doIO())
//aa.map(a=>a.doIO())
//console.log(IOList)

//fp.List({a:1}).data.map(a=>console.log(a))
//fp.map(()=>{})(IOList)
fp.map(a=>a(state).doIO())(IOList)


