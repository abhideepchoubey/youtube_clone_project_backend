import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res) => {
    //get user details from frontend
    //validation - not empty
    //check if user alreday exists : username,email
    //check for images ,check for avatar
    //upload them to cloudinary, avatar
    //create user object - create entry in db
    //remove password & refresh token field from response
    //check for user creation
    // return res

    // console.log("FILES:", req.files)
    // console.log("BODY:", req.body)

    const {fullname ,email,username,password}=req.body
    // console.log("email : ",email)

    // if(fullname===""){
    //     throw new ApiError(400,"fullname is required")
    // }

    if(
        [fullname,email,username,password].some((field)=> field?.trim() === "")
    ){
        throw new ApiError(400,"All fields are required")
    }

    const existedUser= await User.findOne({
        $or:[{username} , {email}]
    })
    
    if(existedUser){
        throw new ApiError(409,"User already exists")
    }

    //console.log(req.files);
    
    const avatarLocalPath = req.files?.avatar?.[0]?.path

    // const coverImageLocalPath = req.files?.coverImage?.[0]?.path

    let coverImageLocalPath;
    if ( req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }


    //console.log(avatarLocalPath)

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    //console.log(avatar)

    if(!avatar) {
        throw new ApiError(400, "Avatar file is not uploaded , try again")
    }
    
    const user = await User.create({
        fullname,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) {
        throw new ApiError(500 ,"Something went wrong while registering a user")
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser ,"User registered successfully")
    )
})

const loginUser = asyncHandler(async (req,res) => {
    const {email,password}=req.body 

    if(
        [email,password].some((field)=> field?.trim() === "")
    ){
        throw new ApiError(400,"All fields are required")
    }
    const existedUser= await User.findOne({ email })
    
    if(!existedUser){
        throw new ApiError(404,"User doesn't exist")
    }

    const isPasswordCorrect = await existedUser.isPasswordCorrect(password)
    if(!isPasswordCorrect) {
        throw new ApiError(401, " Invalid Credentials ")
    }

    const loggedInUser = await User.findById(existedUser._id).select("-password -refreshToken")
    return res.status(200).json(
        new ApiResponse(200, loggedInUser ,"User logged in successfully")
    )
    
})


export {registerUser}

export { loginUser }