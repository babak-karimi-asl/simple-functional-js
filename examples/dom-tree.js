
/*** simple elements ***/
const tag = f.assoc('tag')
const css = f.assoc('css')
//const assocId = f.assoc('id')
const basicElem = t=>c=>f.compose(f.assoc('_type')('HtmlElement'),tag(t),css(c))({})
const idFromLens = f.compose(f.strToLowerCase,f.strArrJoin('-'),f.prop('path'))
//const uniqueElem = lens=>f.compose(f.assoc('id')(idFromLens(lens)),f.deepClone)
const uniqueElem = id=>f.compose(f.assoc('id')(id),f.deepClone)

const treeToHtml=f.cataMap
         ( v=>f.match({
                'Tree':()=> `<${v.parent.tag} css="${v.parent.css}" id="${v.parent.id?v.parent.id:''}">${v.kids[0].join(' ')}</${v.parent.tag}>`,
					      'HtmlElement':()=> `<${v.tag} class="${v.css}"  id="${v.id?v.id:''}" ></${v.tag}>`
				      })('')(v._type)
				 )( i=>fnc=>f.match({
                'Tree':()=> f.tree(i.parent)( i.kids.map(ik=>fnc(ik)) ),
					      'HtmlElement':()=>i
				      })(i)(i._type)
				 )
// layout

/*** elements ***/
const e = {}
e.title = basicElem('h1')('title')
e.input = basicElem('input')('input is-primary')
e.button = basicElem('button')('button is-primary')
e.section = basicElem('section')('section')
e.container = basicElem('container')('container')

//const setText = id=>lens=>store=>f.IO(()=>document.getElementById(id).textContent=f.view(lens,store))


/***unique elements***/
const ue = {}
ue.appTitle = uniqueElem('app-title')(e.title)
ue.submitButton = uniqueElem('submit-button')(e.button)
ue.cancelButton = uniqueElem('cancel-button')(e.button)

const rootElem = f.Tree( e.section ) (  f.Tree(e.container)(ue.appTitle,e.input,ue.submitButton,ue.cancelButton)  )

const textContentSetter = idLens=>valueLens=>store=>f.IO(()=>document.getElementById(id).textContent=f.view(lens)(store))

const state = {
   title:'app-title',
}

document.querySelector('#root').innerHTML = treeToHtml(rootElem)
f.map( g=>g.doIO() )( captionsUpdater(store) )



