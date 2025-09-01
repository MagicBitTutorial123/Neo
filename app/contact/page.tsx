"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (PNG, JPG, WebP)');
        return;
      }
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      setAttachment(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAttachmentPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('email', formData.email);
      formDataToSend.append('message', `Name: ${formData.name}\nSubject: ${formData.subject}\n\nMessage:\n${formData.message}`);
      
      if (attachment) {
        formDataToSend.append('file', attachment);
      }

      // Send to our improved API route
      const response = await fetch('/api/support/contact', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitStatus("success");
        // Reset form after success
        setTimeout(() => {
          setFormData({ name: "", email: "", subject: "", message: "" });
          setAttachment(null);
          setAttachmentPreview(null);
          setSubmitStatus("idle");
        }, 3000);
      } else {
        throw new Error(result.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0]">
             {/* Header */}
       <div className="bg-white shadow-lg border-b border-gray-200">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex items-center justify-between h-20">
             <div className="flex items-center gap-4">
               <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                 <Image 
                   src="/side-logo.png" 
                   alt="Neo Logo" 
                   width={200} 
                   height={100}
                   className="rounded-lg shadow-sm"
                 />
               
               </Link>
             </div>
             <div className="flex items-center gap-4">
               <Link
                 href="/faq"
                 className="px-4 py-2 text-sm font-medium text-[#4A5568] hover:text-[#222E3A] transition-colors"
               >
                 FAQ
               </Link>
               <Link
                 href="/"
                 className="px-6 py-3 bg-[#4A90E2] text-white font-medium rounded-lg hover:bg-[#357ABD] transition-colors shadow-sm"
               >
                 Back to Home
               </Link>
             </div>
           </div>
         </div>
       </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#222E3A] mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-[#4A5568] max-w-2xl mx-auto">
            Have a question or need help? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-semibold text-[#222E3A] mb-6">
              Send us a message
            </h2>
            
                         {submitStatus === "success" && (
               <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                 <div className="flex items-center gap-2 text-green-800">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                     <path
                       d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                       stroke="currentColor"
                       strokeWidth="2"
                       strokeLinecap="round"
                       strokeLinejoin="round"
                     />
                   </svg>
                   <span className="font-medium">Message sent successfully!</span>
                 </div>
                 <p className="text-green-700 text-sm mt-1">
                   We'll get back to you as soon as possible. Check your email for confirmation.
                 </p>
               </div>
             )}

             {submitStatus === "error" && (
               <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                 <div className="flex items-center gap-2 text-red-800">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                     <path
                       d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                       stroke="currentColor"
                       strokeWidth="2"
                       strokeLinecap="round"
                       strokeLinejoin="round"
                     />
                   </svg>
                   <span className="font-medium">Failed to send message</span>
                 </div>
                 <p className="text-red-700 text-sm mt-1">
                   Please try again or contact us directly at support@neo.com
                 </p>
               </div>
             )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#222E3A] mb-2">
                  Name
                </label>
                                 <input
                   type="text"
                   id="name"
                   name="name"
                   value={formData.name}
                   onChange={handleInputChange}
                   required
                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent transition-colors text-[#222E3A] placeholder-gray-500"
                   placeholder="Your name"
                 />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#222E3A] mb-2">
                  Email
                </label>
                                 <input
                   type="email"
                   id="email"
                   name="email"
                   value={formData.email}
                   onChange={handleInputChange}
                   required
                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent transition-colors text-[#222E3A] placeholder-gray-500"
                   placeholder="your.email@example.com"
                 />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-[#222E3A] mb-2">
                  Subject
                </label>
                                 <select
                   id="subject"
                   name="subject"
                   value={formData.subject}
                   onChange={handleInputChange}
                   required
                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent transition-colors text-[#222E3A]"
                 >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="technical">Technical Support</option>
                  <option value="billing">Billing Question</option>
                  <option value="feature">Feature Request</option>
                  <option value="bug">Bug Report</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-[#222E3A] mb-2">
                  Message
                </label>
                                 <textarea
                   id="message"
                   name="message"
                   value={formData.message}
                   onChange={handleInputChange}
                   required
                   rows={5}
                   maxLength={1500}
                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent transition-colors resize-none text-[#222E3A] placeholder-gray-500"
                   placeholder="Tell us how we can help..."
                 />
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-gray-500">
                    {formData.message.length}/1500
                  </span>
                </div>
              </div>

              {/* Attachment Section */}
              <div>
                <label className="block text-sm font-medium text-[#222E3A] mb-2">
                  Attachment (optional)
                </label>
                
                {attachment ? (
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        {attachment.name}
                      </span>
                      <button
                        type="button"
                        onClick={removeAttachment}
                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                        title="Remove attachment"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                    {attachmentPreview && (
                      <div className="relative w-full h-32 bg-white rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={attachmentPreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="mt-2 text-xs text-gray-500">
                      Size: {(attachment.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="attachment"
                    className="group flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-6 text-center cursor-pointer hover:border-[#4A90E2] hover:bg-gray-50 transition-colors"
                    title="Click or drop an image"
                  >
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-gray-400 group-hover:text-[#4A90E2]"
                    >
                      <path
                        d="M12 5v14M5 12h14"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="text-sm text-gray-600">
                      Click to upload or drag & drop an image
                    </span>
                    <span className="text-xs text-gray-400">
                      PNG, JPG, WebP up to 5MB
                    </span>
                    <input
                      id="attachment"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ name: "", email: "", subject: "", message: "" });
                    setAttachment(null);
                    setAttachmentPreview(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-[#4A90E2] text-white font-medium rounded-lg hover:bg-[#357ABD] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Quick Help */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="w-12 h-12 bg-[#F0F4F8] rounded-full flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#4A90E2]">
                  <path
                    d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#222E3A] mb-2">
                Need quick help?
              </h3>
              <p className="text-[#4A5568] mb-4">
                Check our FAQ page for answers to common questions.
              </p>
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 text-[#4A90E2] hover:text-[#357ABD] font-medium"
              >
                View FAQ
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 18l6-6-6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>

            {/* Contact Methods */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-xl font-semibold text-[#222E3A] mb-6">
                Other ways to reach us
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F0F4F8] rounded-full flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#4A90E2]">
                      <path
                        d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M22 6l-10 7L2 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-[#222E3A]">Email Support</p>
                    <p className="text-sm text-[#4A5568]">support@neo.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F0F4F8] rounded-full flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#4A90E2]">
                      <path
                        d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-[#222E3A]">Phone Support</p>
                    <p className="text-sm text-[#4A5568]">+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F0F4F8] rounded-full flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#4A90E2]">
                      <path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-[#222E3A]">Response Time</p>
                    <p className="text-sm text-[#4A5568]">Within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
