import mongoose from 'mongoose';

const savedVideoSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    videoUrl: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    isWatched: {
      type: Boolean,
      default: false,
    },
    watchedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const SavedVideo = mongoose.model('SavedVideo', savedVideoSchema);

export default SavedVideo; 