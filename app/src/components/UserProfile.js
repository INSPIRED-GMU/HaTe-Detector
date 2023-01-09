import {useLocation} from 'react-router-dom';
export default function UserProfile () {
    const location = useLocation();
    return(
        <div>
            <div className="navbar bg-base-100">
  <div className="flex-1">
  <div className="w-10 rounded-full">
          <img className="rounded-full" src={location.state.img} />
        </div>
    <a className="btn btn-ghost normal-case text-xl">@{location.state.name}</a>
  </div>
  <div className="flex-none gap-2">
  </div>
</div>

        </div>
    )
}