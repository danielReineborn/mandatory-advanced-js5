import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Star, StarBorder } from '@material-ui/icons';
import { BrowserRouter, Router, Link } from "react-router-dom";

import { filterOutIconsToRender } from "../utilities/FilterOutIconsToRender";
import FileItemDropdown from './FileItemDropdown';
import { getFilesMetadata, getFilesThumbnail } from "../api/API";
import { convertToHumanReadableSize, convertToHumanReadableTime } from '../utilities';
import { toggleFavorite, favorites$ } from "../Observables/Store";

const Container = styled.div`
    display: flex;

    

    :first-child > div {
        border-top: 1px solid #e6e8eb;
    }

    .flex-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        margin: 0px 50px;
        border-bottom: 1px solid #e6e8eb;
        color: #202020;
        box-sizing: border-box;
        transition: all 0.1s ease-in;
        :hover {
            cursor: ${props => props.isFolderIcon === "folder" ? "pointer" : "default"};
            color: #92ceff;
            background-color: rgb(153, 198, 224, 0.1);
        }


        :hover > div:last-child .meny {
            border: 2px solid #637282;

            :hover {
                border: 2px solid #92ceff;
                cursor: pointer;
            }
        }
    }

    .left-content {
        display: flex;
        align-items: center;
        justify-content: flex-start;
    }

    .right-content {
        position: relative;
        display: flex;
        align-items: center;
    }

    .icon-container {
        display: flex;
        align-items: center;
    }

    .data-format {
        font-size: 35px;
        padding-left: 12px;
        color: ${props => props.isFolderIcon === 'folder' ? '#92ceff' : '#ACC2CC'};
    }

    .name-cont {
        display: flex;
        justify-content: center;
        flex-direction: column;
        padding: 0px 15px;
    }

    .file-star-container {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        padding-top: 10px;
    }

    .metadata {
        color: #637282;
        font-size: 12px;
    }

    .date {
        padding-right: 15px;
    }

    .file {
        margin-right: 5px;
        color: #202020;
        :hover {
            color: #92ceff;
        }
    }

    .star {
        :hover {
            cursor: pointer;
        }
    }

    .meny-container {
        justify-content: flex-end;
    }

    p {
        margin-block-start: 0em;
        margin-block-end: 0em;
    }

    a {
        text-decoration: none;

        :link,
        :visited {
            color: black;
        }

        :hover {
            color: #92ceff;
        }
    }
`

function FileItem({ pathname, children, path, getPath, tag, name, file, token, changeURL, starState }) {
    const [modified, setModified] = useState(0);
    const [size, setSize] = useState('');
    const [url, updateUrl] = useState('');

    useEffect(() => {
        let unmounted = false;

        getFilesMetadata(path, token)
            .then(metadata => {
                if (!unmounted) {
                    setModified(metadata.server_modified);
                    setSize(metadata.size);
                }
            })

        if (dataFormat === 'jpg' || dataFormat === 'jpeg' || dataFormat === 'png' || dataFormat === 'gif' || dataFormat === 'svg' || dataFormat === 'bmp' || dataFormat === 'webp') {
            getFilesThumbnail(path, token)
                .then(res => {
                    updateUrl(window.URL.createObjectURL(res.fileBlob))
                })

        }

        return () => {
            unmounted = true;
        }
    }, [])

    let dataFormat = name.substring(name.lastIndexOf('.') + 1, name.length);

    function toggleCheck(file) {
        toggleFavorite(file); //Takes file from prop.
    }

    function onClick(e) {
        if (tag === "folder") {
            getPath(path);
        }
    }

    function iconsToRender(tag, name) {
        return filterOutIconsToRender(tag, name);
    }

    let link = "";
    if (changeURL) {
        link = tag === "folder" ?
            <Link to={"/home" + path}><p onClick={onClick} className="file">{children}</p></Link> :
            <div><p onClick={onClick} className="file">{children}</p></div>
    } else {
        link = <div><p onClick={onClick} className="file">{children}</p></div>
    }

    return (
        <Container isFolderIcon={tag}>
            <div className="flex-container">
                <div className="left-content">
                    <div className="icon-container">
                        {url ? <img src={url} /> : <i className="material-icons data-format">{iconsToRender(tag, name)}</i>}
                    </div>
                    <div className="name-cont">
                        <div className="file-star-container">
                            {link}
                            {starState ? <Star className="star" onClick={() => toggleCheck(file)}></Star> : <StarBorder className="star" onClick={() => toggleCheck(file)}></StarBorder>}
                        </div>
                        <div className="metadata-container">
                            <span className="metadata date">{tag === 'file' ? `Modified: ${convertToHumanReadableTime(modified)}` : null}</span>
                            <span className="metadata kilobyte">{convertToHumanReadableSize(size)}</span>
                        </div>
                    </div>
                </div>
                <div className="right-content">
                    <FileItemDropdown file={file} />
                </div>
            </div>
        </Container >
    )
}

export default FileItem;
