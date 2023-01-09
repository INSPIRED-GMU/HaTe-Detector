import { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
import UserProfile from "./UserProfile";
import PulseLoader from "react-spinners/PulseLoader";
import axios from "axios";

export default function Workspace(){
    const [repos, setrepos] = useState(null)
    const [files, setfiles] = useState(null)
    const [content, setcontent] = useState(null)
    const [wordIndex, setwordIndex] = useState([])
    const [delimiters, setdelimiters] = useState([])
    const [replaceWords, setreplaceWords] = useState({'react':['vue','svelte'],'app':['product'],'create':['produce']})
    const [selectedWord, setselectedWord] = useState(null)
    const [feedback, setfeedback] = useState('')
    const [defs, setdefs] = useState(null)
    const [toast, settoast] = useState(false)
    const [fileUrl, setfileUrl] = useState("#")
    const location = useLocation();
    useEffect(() => {
        getRepos()
    }, [wordIndex])
    const getRepos = () =>{
        let repos_temp = [];
        axios({
          method: 'post',
          url: `http://localhost:2400/getRepo`,
          headers: { 
            'Content-Type': 'application/json'
          },
          data:JSON.stringify({
              user:location.state.name,
              authToken:location.state.token
        })
        }).then((response) => {
        let userRepos = response.data.userRepos
        console.log(userRepos);
        const repos_list = userRepos.map(repo => repo.name);
        const ids = userRepos.map(repo => repo.id);
        for (var i = 0; i < repos_list.length; i++) {
        repos_temp.push({
            name: repos_list[i],
            id: ids[i]
        });
        }
        console.log("Temp:",repos_temp)
        setrepos(repos_temp)
        })
      }


      const getFiles = (repo) =>{
        let files_temp = [];
        axios({
          method: 'post',
          url: `http://localhost:2400/getFilesFromRepo`,
          headers: { 
            'Content-Type': 'application/json'
          },
          data:JSON.stringify({
              name:location.state.name,
              repo:repo,
              authToken:location.state.token
        })
        }).then((response) => {
        let repoFiles = response.data.repoFiles.items
        console.log(repoFiles);
        const file_list = repoFiles.map(repo => repo.name);
        const path_list = repoFiles.map(repo => repo.path);
        const repo_list = repoFiles.map(repo => repo.repository.full_name);
        for (var i = 0; i < file_list.length; i++) {
        files_temp.push({
            name: file_list[i],
            path: path_list[i],
            repo: repo_list[i]
        });
        }
        setfiles(files_temp)
        })
      }
      const loadFile = (file,fullRepo) =>{
          console.log(file,fullRepo)
        axios({
          method: 'post',
          url: `http://localhost:2400/loadFile`,
          headers: { 
            'Content-Type': 'application/json'
          },
          data:JSON.stringify({
              name:location.state.name,
              repo:fullRepo,
              path:file,
              authToken:location.state.token
        })
        }).then((response) => {
        let fileContent = response.data
        console.log(fileContent.words);
        setcontent(fileContent.decoded)
        setdelimiters(fileContent.words)
        let alt_temp = {}
        for(var i=0;i<fileContent.alternates.length;i++){
            if(Object.keys(fileContent.alternates[i]).length>1){
                alt_temp[fileContent.alternates[i].words]=fileContent.alternates[i].alternates.toString().split(',')
            }
            else{
                alt_temp[fileContent.alternates[i].words]=['*rephrase this*']
            }
        }
        setreplaceWords(alt_temp)
        console.log("Alternates:",alt_temp)

        let defs_temp = {}
        console.log(fileContent.definitions.length)
        for(var i=0;i<fileContent.definitions.length;i++){
            defs_temp[fileContent.definitions[i].terms]=fileContent.definitions[i].def
        }
        setdefs(defs_temp)
        console.log("Definitions:",defs_temp)

        formatContent(fileContent.decoded,fileContent.words,alt_temp,defs_temp)
        })
      }

      const formatContent = (file,words,altDict,definitions) => {
          let str = '('
          for (var i=0;i<words.length;i++){
            str+=words[i]
            if(i+1!=words.length){
                str+='|'
            }
          }
          str+=')'
        var regex = new RegExp(str,"i");
        console.log("REGEX:",regex)
        const splitString = file.split(regex);
        setwordIndex(splitString)
      }

      const itemReplacer = (oldItem, newItem) =>{
        var array = [...wordIndex]
        console.log(array[1], oldItem, newItem)
        console.log(array[1]===oldItem)
        array.map((item, index) => item === oldItem ? array.splice(index, 1, newItem) : item);
        setwordIndex(array)
      }

      const downloadMdFile = () => {    
        const file = new Blob(wordIndex.filter(x => x !== undefined), {type: 'text/markdown'});
        setfileUrl(URL.createObjectURL(file));
    }

    const submitFeedback = () =>{
        console.log(feedback)
        axios({
          method: 'post',
          url: `http://localhost:2400/submitFeedback`,
          headers: { 
            'Content-Type': 'application/json'
          },
          data:JSON.stringify({
              word:selectedWord,
              feedback:feedback,
        })
        }).then((response) => {
        let status = response.data.status
        console.log(status);
        if(status=="success"){
            settoast(true)
            setTimeout(() => {
                settoast(false)
            }, 3000);

        }
        
        })
      }


    return(
        <div>
            <UserProfile/>
            <div className="w-full bg-base-100 min-h-screen min-w-screen">
            {repos==null &&<PulseLoader
                size={20}
                className="ml-5 mt-5"
                color={'#baabb7'}
            />}
            <div className="overflow-x-auto flex flex-row grid-cols-3 gap-2 px-5">
                <div className="col-span-2">
            {repos!=null &&<table className="table w-sm">
                <thead>
                <tr>
                    <th></th>
                    <th>Repository</th>
                </tr>
                </thead>
                <tbody>
             
                {repos.map((repo) =>(<tr className="hover">
                    <th></th>
                    <td onClick={()=>getFiles(repo.name)}>{repo.name}</td>
                </tr>))}
                
                </tbody>
            </table>}
            </div>
            <div className="col-span-2">
            {files!=null &&<table className="table w-sm">
                <thead>
                <tr>
                    <th></th>
                    <th>File</th>
                </tr>
                </thead>
                <tbody>
             
                {files.map((_file) =>(<tr className="hover">
                    <th></th>
                    <td onClick={()=>loadFile(_file.path,_file.repo)}>{_file.name}</td>
                </tr>))}
                
                </tbody>
            </table>}
            </div>
            
            <div className="col-start-5 col-end-10">
            {content!=null &&<div className="mockup-window border bg-base-200 self-end">
            {selectedWord && <div className="mockup-window border bg-base-300 self-end">
            <div className="justify-center px-16 py-4 bg-base-300">
            <div className="text-lg text-red-100"><span className="text-red-300">{selectedWord}</span>: {defs[selectedWord]}</div>
                Select a word you would like to replace it with
            {replaceWords[selectedWord].map((str) =><span onClick={()=>itemReplacer(selectedWord,str)} className="block text-green-100 hover:text-green-800">{str}</span>)}
                </div>
                <div className="form-control w-full max-w-xs pl-16 pb-6">
            <label className="label">
                <span className="label-text">Submit Feedback</span>
            </label>
            <input type="textarea" placeholder="Type here" multi={5} value={feedback} onChange={e=>setfeedback(e.target.value)} className="input input-bordered w-full max-w-xs" />
            <button onClick={()=>submitFeedback()} className="btn btn-glass mt-5">Submit</button>
            </div>
            {toast &&<div className="alert alert-success shadow-lg">
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Thank you for your feedback</span>
            </div>
            </div>}
            </div>}
            <div className="justify-center px-4 py-16 bg-base-200 max-h-50 overflow-auto">
            {wordIndex.map((str) =>(!delimiters.includes(str) ?(<span className={"inline text-sm"}>
                    {str}
                </span>):(<span onClick={()=>setselectedWord(str)} className={"underline inline text-red-100 hover:text-red-800"}>{str}</span>)
                ))}
            </div>
            <button className="btn btn-glass my-5 mx-5" onClick={()=>downloadMdFile()}><a href={fileUrl} download="inclusiveFile.md">Save File</a></button>
           
            </div>}
            </div>
            </div>
            </div>
        </div>
    )
}