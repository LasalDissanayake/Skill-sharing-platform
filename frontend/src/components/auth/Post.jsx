import React, { useState } from 'react';

function Post() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    codeSnippet: '',
    tags: '',
  });
  const [mediaFiles, setMediaFiles] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + mediaFiles.length > 3) {
      alert('You can only upload up to 3 media files');
      return;
    }
    setMediaFiles([...mediaFiles, ...files]);
  };

  const removeFile = (index) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log({ ...formData, mediaFiles });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-PrimaryColor rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-ExtraDarkColor mb-6">Create New Post</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Title Input */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-ExtraDarkColor mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-SecondaryColor rounded-md focus:outline-none focus:ring-2 focus:ring-DarkColor"
            placeholder="Enter post title"
            required
          />
        </div>

        {/* Content Textarea */}
        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-ExtraDarkColor mb-1">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows="4"
            className="w-full px-3 py-2 border border-SecondaryColor rounded-md focus:outline-none focus:ring-2 focus:ring-DarkColor"
            placeholder="Share your knowledge here..."
            required
          ></textarea>
        </div>

        {/* Code Snippet */}
        <div className="mb-4">
          <label htmlFor="codeSnippet" className="block text-sm font-medium text-ExtraDarkColor mb-1">
            Code Snippet (optional)
          </label>
          <textarea
            id="codeSnippet"
            name="codeSnippet"
            value={formData.codeSnippet}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-SecondaryColor rounded-md font-mono text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-DarkColor"
            placeholder="// Paste your code here"
          ></textarea>
        </div>

        {/* Media Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-ExtraDarkColor mb-1">
            Media Files (Max 3)
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-SecondaryColor border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-PrimaryColor">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-2 text-DarkColor" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
                <p className="mb-1 text-sm text-DarkColor"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-DarkColor">{`${mediaFiles.length}/3 files uploaded`}</p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*, video/*" 
                onChange={handleFileChange}
                disabled={mediaFiles.length >= 3}
              />
            </label>
          </div>

          {/* Display uploaded files */}
          {mediaFiles.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {mediaFiles.map((file, index) => (
                <div key={index} className="relative">
                  <div className="p-2 border rounded-md bg-PrimaryColor flex items-center">
                    <span className="text-xs truncate max-w-[150px]">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="ml-2 text-ExtraDarkColor hover:text-DarkColor"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tags Input */}
        <div className="mb-6">
          <label htmlFor="tags" className="block text-sm font-medium text-ExtraDarkColor mb-1">
            Tags (comma separated)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-SecondaryColor rounded-md focus:outline-none focus:ring-2 focus:ring-DarkColor"
            placeholder="react, javascript, beginner"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-DarkColor text-white rounded-md hover:bg-ExtraDarkColor focus:outline-none focus:ring-2 focus:ring-SecondaryColor focus:ring-offset-2 transition-colors"
          >
            Publish Post
          </button>
        </div>
      </form>
    </div>
  );
}

export default Post;