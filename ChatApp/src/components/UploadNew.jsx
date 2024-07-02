import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

function UploadNew() {
    const userData = JSON.parse(localStorage.getItem("userData"))
    const navigate = useNavigate();

    const [selectedFile, setSelectedFile] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [title,setTitle] = useState("");
    const [description,setDescription] = useState("");
    const [prompt , setPrompt] = useState("");
    const [promptResponse , setPromptResponse] = useState("");
    const [loading,setLoading] = useState(false);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        // If a file is selected
        if (file) {
            console.log(file)
            setSelectedFile(file);

            // Read the selected image and convert it to a data URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleOnUpload = async ()=>{
        const config = {
            headers: {
                Authorization: `Bearer ${userData.data.token}`,
                "Content-Type": "multipart/form-data" 
            },
        };

        try {
            const formData = new FormData();
            formData.append('image', selectedFile);
            formData.append('title', title);
            formData.append('desc', description);


            const response = await axios.post(
                "http://localhost:8000/user/uploadContent",
                formData,
                config
            )
            if(response){
                console.log(response);
                navigate("/user/my-uploads")
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(()=>{
        if(!userData){
            console.log("Not authenticated. Login is required")
            navigate("/user/login")
        }
      
    },[])

    function formatText(text) {
        // Replace bold formatting
        text = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        // Replace line breaks
        text = text.replace(/\*/g, '</br>');
        return text;
    }

    const handlePromptResponse = ()=>{
        setLoading(true);

        const config = {
            headers: {
                Authorization: `Bearer ${userData.data.token}`,
            }
        };

        const sendPrompt = async ()=>{
            try {
                const response = await axios.post(
                    "http://localhost:8000/user/getPromptResponse",
                    {
                        prompt : prompt
                    },
                    config
                )
                if(response){
                    console.log(response.data);
                    let responseText = response.data; 
                    // let responseArray = responseText.split("**");
                    // console.log(responseArray)
                    // let newResponse;
                    // for(let i=0 ; i<responseArray.length ; i++){
                    //     if(i==0 || i%2!==1){
                    //         newResponse += responseArray[i];
                    //     }
                    //     else{
                    //         newResponse += "<b>"+responseArray[i]+"</b>";
                    //     }
                    // }
                    // let newResponse2 = newResponse.split("*").join("</br>")
                    // console.log(newResponse2)
                    // setPromptResponse(newResponse2)

                    const formattedText = formatText(responseText);
                    console.log(formattedText)
                    setPromptResponse(formattedText)
                    setLoading(false);
                }
                
            } catch (error) {
                console.log(error)
            }
        }

        sendPrompt()
    }

    return (
    <div className='new-uploads-div'>
        <div className='new-uploads'>
            <div className='img-text-div'>
                <div className='newupload-image-div'>
                    <div className='image-div'>
                        {selectedFile && (
                            <div>
                                {/* <p>Selected file: {selectedFile.name}</p> */}
                                <img
                                    src={imageUrl}
                                    alt="Selected"
                                    style={{ maxWidth: '100%', maxHeight: '300px' }}
                                />
                            </div>
                        )}
                    </div>
                    <div>
                        <input type="file" accept="image/*" className='input-image' onChange={handleFileChange}/>
                        {/* <button>Choose an Image</button> */}
                    </div>
                </div>
                <div className='title-des-div'>
                    <div className='title-div'>
                        <label htmlFor="title">Title</label>
                        <textarea id="title" rows="2" cols="40" className='title-input' value={title} onChange={(e)=>setTitle(e.target.value)}></textarea>
                    </div>
                    <div className='des-div'>
                        <label htmlFor="description">Description</label>
                        <textarea id="description" rows="10" cols="40" className='des-input' value={description} onChange={(e)=>setDescription(e.target.value)}></textarea>
                    </div>
                </div>
            </div>
            <button className='upload-btn' onClick={handleOnUpload} >Upload</button>
        </div>
        <div className='prompt'>
            <div className='prompt-chatarea'>
                <div className='prompt-msg'>
                    {loading ? 
                    <div className='prompt-loader'>
                        <hr />
                        <hr />
                        <hr />
                    </div> : 
                    <p className='prompt-response-para' dangerouslySetInnerHTML={{__html:promptResponse}}></p>}
                </div>
            </div>
            <div className='prompt-input-area'>
                <input className='prompt-input' type="text" placeholder='Type your prompt...' value={prompt} onChange={(e)=>setPrompt(e.target.value)}/>
                <button onClick={handlePromptResponse}>Send</button>
            </div>
        </div>
    </div>
  )
}

export default UploadNew
