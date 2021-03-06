import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom"

import styled from "styled-components";

import { Dropbox } from 'dropbox';

import { filterOutIconsToRender } from "../utilities/FilterOutIconsToRender";
import { filesListFolder, fetchDataFromUser } from "../api/API";
import { token$, toggleFavorite, favorites$ } from '../Observables/Store';

import FileItem from "./FileItem";
import LoadingCircle from "./LoadingCircle";

const Container = styled.aside`
  .shadow{
    position: fixed;
    top: 0;
    left: 0;
    width: ${props => props.width + 'px'};
    height: 100%;
    background-color: rgba(14, 37, 52, 0.15);
    z-index: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .row{
    display:flex;
  }
  .column{
    display: flex;
    flex-direction: column;
  }
  .left{
    margin-left: 20px;
  }
  .input{
    width: 90%;
    padding: 5px;
    border: 1px solid black;
    border-radius: 5px;
  }
  .miniTitle{
    margin-bottom: 5px;
    color: grey;
    font-size: 14px;
  }
  .border{
    width: 400px;
    height: 500px;
    background-color: white;
    border-radius: 10px;
  }
  .icon-container{
    display: flex;
    align-items: center;
  }
  .data-format {
    font-size: 35px;
    padding-left: 12px;
    color: #92ceff;
    margin-top: 15px;
    margin-left: 8px;
    margin-right: 10px;
  }
  .myFooter{
    display:flex;
    jusitfy-content: flex-start;
    align-items: center;
    width:100%;
    height: 60px;
    position: relative;
    border-radius: 0px 0px 10px 10px;
    border-top: 1px solid rgba(222, 222, 222, 1);
    background-color: rgba(245, 245, 245, 1);
    z-index: 2;
  }
  .btn{
    width: 100px;
    height: 40px;
    margin-left: 10px;
    border: 0.5px solid gray;
    border-radius: 10px;
  }
  .create{
    background-color: rgba(41, 116, 255, 1);
    border: 0px;
    color: white;
    margin-right: 15px;
  }
  .cancel{
    margin-left: 180px;
    background-color: white;
  }
  .upload{
    background-color: rgba(41, 116, 255, 1);
    border: 0px;
    color: white;
  }
  .overFlow{
    position: relative;
    overflow-y:scroll;
    overflow-x:hidden;
    height: 300px;
    display:flex;
    flex-direction: column;
  }
  .center{
    height: 300px;
    display:flex;
    justify-content: center;
    align-items: center;
  }
  .flex-container {
    margin-left: 0px !important;
    margin-right: 0px !important;
  }
  .metadata-container{
    display:none;
  }
  .right-content{
    display:none !important;
  }
  .MuiSvgIcon-root{
    display:none !important;
  }
`;

function CopyFile(props) {
  const [token, setToken] = useState(token$.value);
  const [state, updateState] = useState({
    files: [],
  })
  const [loading, setLoading] = useState(true);
  const [path, updatePath] = useState("/");
  const [error, setError] = useState(false);
  useEffect(() => {
    const subscription = token$.subscribe(setToken);
    return () => subscription.unsubscribe();
  }, []);

  const { displayCopy } = props;

  useEffect(() => {
    setLoading(true);
    fetchDataFromUser(token)
      .then((response) => {
        updateState({
          files: response,
        })
        setLoading(false);
      }).catch((err) => {
        console.error(err);
        setError(true);
      })
  }, [])

  function handlePath(path) {
    setLoading(true);
    filesListFolder(token, path)
      .then((response) => {
        updateState({
          files: response.entries
        })
        updatePath(path)
      })
      .catch((err) => {
        console.error(err);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      })

  }

  function onCopy() {
    const dbx = new Dropbox({ accessToken: token, fetch });
    setLoading(true);
    let pathFix = path;
    if (pathFix === "/") {
      pathFix = "";
    }
    dbx.filesCopy(
      {
        from_path: props.file.path_lower,
        to_path: pathFix + "/" + props.file.name,
        autorename: true,
      }
    ).catch((error) => {
      console.error(error)
      setError(true);
    })
      .finally(() => {
        setLoading(false);
        displayCopy(false);
      })
  }

  function onMove() {
    const dbx = new Dropbox({ accessToken: token, fetch });
    setLoading(true);
    let pathFix = path;
    if (pathFix === "/") {
      pathFix = "";
    }
    if (favorites$.value.find(x => x.id === props.file.id)) {
      toggleFavorite(props.file);
    }
    dbx.filesMove(
      {
        from_path: props.file.path_lower,
        to_path: pathFix + "/" + props.file.name,
        autorename: true,
      }
    )
      .catch((error) => {
        console.error(error)
        setError(true);
      })
      .finally(() => {
        setLoading(false);
        displayCopy(false)
      })
  }


  function onReturn(path) {
    let splittedPath = path.split("/");
    let newPath = "";
    for (let i = 1; i < splittedPath.length - 1; i++) {
      if (i !== splittedPath.length || splittedPath !== "") {
        newPath += "/" + splittedPath[i];
      }
    }
    handlePath(newPath)
    updatePath(newPath);
  }

  let loadingReturn;
  if (loading) {
    loadingReturn = (<div className="center"><LoadingCircle scale={1} /></div>)
  } else {
    loadingReturn = (<div className="overFlow">
      {state.files.filter((file) => file[".tag"] === "folder").map((x) => {
        return <FileItem
          files={state.files}
          tag={x['.tag']}
          getPath={handlePath}
          path={x.path_lower}
          file={x}
          id={x.id}
          key={x.id}
          name={x.name}
          token={token}
          changeURL={false}
        >{x.name}

        </FileItem>;
      })}
    </div>)
  }

  return ReactDOM.createPortal(
    <Container width={window.innerWidth}>
      <div className="shadow">
        <div className="border">
          <header className="row">
            <i className="material-icons data-format folderIcon">{filterOutIconsToRender("folder", "")}</i>
            <h3>{props.copy ? "Copy file/folder" : "Move file/folder"}</h3>
          </header>
          <div className="column left">
            <div>
              <p className="miniTitle">{props.copy ? "Copy : " + props.file.name : "Move : " + props.file.name}</p>
              {error ? <p className="miniTitle" style={{ color: "red" }}>Something went wrong, try again</p> : null}
            </div>
            <div>
              <p className="miniTitle">Location : Dropbox/home{path.replace(/%20/g, " ")}</p>
              {loadingReturn}
            </div>
          </div>
          <footer className="myFooter">
            <button className="btn return" onClick={(e) => onReturn(path)}>Return</button>
            <button className="btn cancel" onClick={() => displayCopy(false)}>Cancel</button>
            <button className="btn create" onClick={props.copy ? onCopy : onMove}>{props.copy ? "Paste" : "Move"}</button>
          </footer>
        </div>
      </div>
    </Container>,
    document.getElementById('portal-copy')
  )
}

export default CopyFile