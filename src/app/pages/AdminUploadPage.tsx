import { motion } from 'motion/react';
import { useState } from 'react';
import { Upload, Music, Mic, Image, X } from 'lucide-react';
import { toast } from 'sonner';
import { uploadService } from '../../services/uploadService';

export const AdminUploadPage = () => {
  const [uploadType, setUploadType] = useState<'song' | 'podcast'>('song');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [category, setCategory] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!audioFile || !coverImage) {
      toast.error('Please select both audio and cover image files');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Upload cover image first
      setUploadProgress(20);
      const imageResponse = await uploadService.uploadImage(coverImage);
      const coverImageUrl = imageResponse.data.url;

      // Upload audio file
      setUploadProgress(50);
      const audioResponse = await uploadService.uploadAudio(audioFile);
      const audioUrl = audioResponse.data.url;

      // Create track with all data
      setUploadProgress(80);
      await uploadService.uploadTrack({
        title,
        artist,
        album,
        category: uploadType,
        audioUrl,
        coverImage: coverImageUrl,
        genre: category || undefined,
      });

      setUploadProgress(100);
      toast.success(`${uploadType === 'song' ? 'Track' : 'Podcast'} uploaded successfully!`);
      
      // Reset form
      setTimeout(() => {
        setTitle('');
        setArtist('');
        setAlbum('');
        setCategory('');
        setCoverImage(null);
        setAudioFile(null);
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Upload failed');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl mb-2">Upload Content</h1>
        <p className="text-gray-400">Add new tracks and podcasts to the platform</p>
      </motion.div>

      {/* Type Toggle */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex gap-2 p-1 bg-white/5 rounded-lg backdrop-blur-xl border border-white/10 max-w-sm"
      >
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setUploadType('song')}
          className={`flex-1 py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 ${
            uploadType === 'song'
              ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-black shadow-lg'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Music className="w-5 h-5" />
          Song
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setUploadType('podcast')}
          className={`flex-1 py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 ${
            uploadType === 'podcast'
              ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-black shadow-lg'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Mic className="w-5 h-5" />
          Podcast
        </motion.button>
      </motion.div>

      {/* Upload Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Audio File Upload */}
          <div>
            <label className="block text-sm mb-3 text-gray-300">
              {uploadType === 'song' ? 'Audio File' : 'Podcast Episode'} *
            </label>
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
                audioFile
                  ? 'border-emerald-400 bg-emerald-400/10'
                  : 'border-white/20 hover:border-emerald-400/50 bg-white/5'
              }`}
            >
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
              />
              <div className="text-center pointer-events-none">
                {audioFile ? (
                  <>
                    <Music className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
                    <p className="font-medium text-emerald-400">{audioFile.name}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="font-medium mb-1">Drop your audio file here</p>
                    <p className="text-sm text-gray-400">or click to browse</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div>
              <label className="block text-sm mb-2 text-gray-300">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all"
                placeholder="Enter title"
                required
              />
            </div>

            {/* Artist */}
            <div>
              <label className="block text-sm mb-2 text-gray-300">
                {uploadType === 'song' ? 'Artist' : 'Host'} *
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all"
                placeholder={uploadType === 'song' ? 'Enter artist name' : 'Enter host name'}
                required
              />
            </div>

            {/* Album/Series */}
            <div>
              <label className="block text-sm mb-2 text-gray-300">
                {uploadType === 'song' ? 'Album' : 'Series'}
              </label>
              <input
                type="text"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all"
                placeholder={uploadType === 'song' ? 'Enter album name' : 'Enter series name'}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm mb-2 text-gray-300">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all"
                required
              >
                <option value="">Select category</option>
                {uploadType === 'song' ? (
                  <>
                    <option value="pop">Pop</option>
                    <option value="rock">Rock</option>
                    <option value="electronic">Electronic</option>
                    <option value="hiphop">Hip Hop</option>
                    <option value="jazz">Jazz</option>
                    <option value="classical">Classical</option>
                  </>
                ) : (
                  <>
                    <option value="tech">Technology</option>
                    <option value="business">Business</option>
                    <option value="education">Education</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="news">News</option>
                    <option value="sports">Sports</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm mb-3 text-gray-300">Cover Image *</label>
            <div className="flex gap-4">
              {coverImage && (
                <div className="relative">
                  <img
                    src={URL.createObjectURL(coverImage)}
                    alt="Cover preview"
                    className="w-32 h-32 rounded-lg object-cover border border-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => setCoverImage(null)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="flex-1">
                <div
                  className={`relative border-2 border-dashed rounded-xl p-6 transition-all ${
                    coverImage
                      ? 'border-emerald-400 bg-emerald-400/10'
                      : 'border-white/20 hover:border-emerald-400/50 bg-white/5'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                  <div className="text-center pointer-events-none">
                    <Image className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm font-medium mb-1">
                      {coverImage ? 'Change image' : 'Upload cover image'}
                    </p>
                    <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                />
              </div>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isUploading}
            className={`w-full py-4 bg-gradient-to-r from-emerald-400 to-cyan-400 text-black rounded-xl shadow-lg hover:shadow-emerald-400/50 transition-all flex items-center justify-center gap-2 ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Upload className="w-5 h-5" />
            {isUploading ? 'Uploading...' : `Upload ${uploadType === 'song' ? 'Track' : 'Podcast'}`}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};
