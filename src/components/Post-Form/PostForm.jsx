import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, RTE, Select } from "..";
import appwriteService from "../../appwrite/config";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PostForm({ post }) {
  const { register, handleSubmit, watch, setValue, control, getValues } =
    useForm({
      defaultValues: {
        title: post?.title || "",
        slug: post?.$id || "",
        content: post?.content || "",
        status: post?.status || "active",
      },
    });

  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);

  const submit = async (data) => {
    if (post) {
      const file = data.image[0]
        ? await appwriteService.uploadFile(data.image[0])
        : null;

      if (file) {
        appwriteService.deleteFile(post.featureimage);
      }

      const dbPost = await appwriteService.updatePost(post.$id, {
        ...data,
        featureimage: file ? file.$id : undefined,
      });

      if (dbPost) {
        navigate(`/post/${dbPost.$id}`);
      }
    } else {
      const file = await appwriteService.uploadFile(data.image[0]);

      if (file) {
        const fileId = file.$id;
        data.featureimage = fileId;
        const dbPost = await appwriteService.createPost({
          ...data,
          userId: userData.$id,
        });

        if (dbPost) {
          navigate(`/post/${dbPost.$id}`);
        }
      }
    }
  };

  const slugTransform = useCallback((value) => {
    if (value && typeof value === "string")
      return value
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z\d\s]+/g, "-")
        .replace(/\s/g, "-");

    return "";
  }, []);

  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "title") {
        setValue("slug", slugTransform(value.title), { shouldValidate: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, slugTransform, setValue]);

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
      <div className="w-2/3 px-2">
        <Input
          label="Title :"
          placeholder="Title"
          className="mb-4"
          {...register("title", { required: true })}
        />
        <Input
          label="Slug :"
          placeholder="Slug"
          className="mb-4"
          {...register("slug", { required: true })}
          onInput={(e) => {
            setValue("slug", slugTransform(e.currentTarget.value), {
              shouldValidate: true,
            });
          }}
        />
        <RTE
          label="Content :"
          name="content"
          control={control}
          defaultValue={getValues("content")}
        />
      </div>
      <div className="w-1/3 px-2">
        <Input
          label="Featured Image :"
          type="file"
          className="mb-4"
          accept="image/png, image/jpg, image/jpeg, image/gif"
          {...register("image", { required: !post })}
        />
        {post && (
          <div className="w-full mb-4">
            <img
              src={appwriteService.getFilePreview(post.featureimage)}
              alt={post.title}
              className="rounded-lg"
            />
          </div>
        )}
        <Select
          options={["active", "inactive"]}
          label="Status"
          className="mb-4"
          {...register("status", { required: true })}
        />
        <Button
          type="submit"
          bgColor={post ? "bg-green-500" : undefined}
          className="w-full"
        >
          {post ? "Update" : "Submit"}
        </Button>
      </div>
    </form>
  );
}

// explaination of the above code:
// This code imports necessary dependencies and sets up a form using the `useForm` hook from the `react-hook-form` library. It also imports other components and services needed for the form.

// The `useForm` hook is used to initialize the form with default values. In this case, the default values are obtained from the `post` object passed as a prop to the `PostForm` component. If the `post` object is not provided or if any of its properties are undefined, default values are set for the form fields.

// The `register`, `handleSubmit`, `watch`, `setValue`, `control`, and `getValues` functions are destructured from the `useForm` hook. These functions are used to handle form registration, submission, field value retrieval, and manipulation.

// Overall, this code sets up the `PostForm` component with a form that is pre-filled with default values based on the `post` object, allowing users to edit and submit the form with updated data.

// ****************************************
// in hinglish language:

// Yeh code ek 'PostForm' component define karta hai jo 'post' object ko prop ke roop mein leta hai.
// 'useForm' hook ka use karke form ko default values ke saath initialize kiya jata hai. Yeh default values 'post' object se prapt hoti hain.
// Agar 'post' object provided nahi hai ya uske kisi bhi properties undefined hain, to form fields ke liye default values set ki jati hain.
// 'register', 'handleSubmit', 'watch', 'setValue', 'control', aur 'getValues' functions ko 'useForm' hook se destructure kiya jata hai.
// Yeh functions form registration, submission, field value retrieval, aur manipulation handle karne ke liye use kiye jate hain.
// Overall, yeh code 'PostForm' component ko ek form ke saath setup karta hai jo default values ke aadhar par pre-filled hota hai, jo users ko form ko edit karne aur updated data ke saath submit karne ki anumati deta hai.