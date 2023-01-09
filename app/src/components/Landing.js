import Typewriter from '../assets/type.png';
import axios from 'axios';
import LoginGithub from 'react-login-github';
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";

export default function Landing(){
  let navigation = useNavigate();
  const clientID = '<PASTE HERE>'
  const clientSecret = '<PASTE HERE>'
  const onSuccess = response => {console.log("success!",response);getUser(response)};
  const onFailure = response => console.error(response);

  const getUser = (code) =>{
    axios({
      method: 'get',
      url: `http://localhost:2400/github`,
      params:{code:code.code}
    }).then((response) => {
      let userData = response.data.userData
      let accessToken = response.data.accessToken
      console.log(accessToken)
      if (response.status==200){
        navigation('/workspace',{state:{name:userData.login,img:userData.avatar_url,token:accessToken}})
      }
    })
  }
  return(
    <div>
    <div className="hero min-h-screen bg-base-200">
  <div className="hero-content flex-col lg:flex-row-reverse">
    <img src={Typewriter} className="max-w-lg rounded-lg" />
    <div>
      <h1 className="text-5xl font-bold">HaTe Detector</h1>
      <p className="py-8 text-3xl">We make your technical documents more inclusive</p>
      <div className="flex">
      <button className="btn btn-primary"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-github mr-2" viewBox="0 0 16 16">
  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
</svg><LoginGithub clientId="88405f75631e2cfdb261"
        onSuccess={onSuccess}
        onFailure={onFailure}
        scope={'user','repo'}
      /></button>
      {/* <button className="btn btn-accent mx-5"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-upload mr-2" viewBox="0 0 16 16">
  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
  <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
</svg>Upload file</button> */}
      </div>
    </div>
  </div>
</div>
</div>
  )
}