const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Review title cannot exceed 200 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: [1000, 'Review comment cannot exceed 1000 characters']
  },
  images: [{
    public_id: String,
    url: String,
    alt: String
  }],
  isVerifiedPurchase: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  helpfulVotes: {
    type: Number,
    default: 0
  },
  unhelpfulVotes: {
    type: Number,
    default: 0
  },
  votedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    vote: {
      type: String,
      enum: ['helpful', 'unhelpful']
    }
  }],
  vendorResponse: {
    message: String,
    respondedAt: Date,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  moderationFlags: [{
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'fake', 'offensive'],
      required: true
    },
    flaggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    flaggedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isHidden: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
reviewSchema.index({ product: 1 });
reviewSchema.index({ vendor: 1 });
reviewSchema.index({ customer: 1 });
reviewSchema.index({ order: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ isApproved: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ helpfulVotes: -1 });

// Compound index for unique review per order-product combination
reviewSchema.index({ order: 1, product: 1 }, { unique: true });

// Virtual for net helpful votes
reviewSchema.virtual('netHelpfulVotes').get(function() {
  return this.helpfulVotes - this.unhelpfulVotes;
});

// Method to vote on review
reviewSchema.methods.vote = function(userId, voteType) {
  // Check if user already voted
  const existingVote = this.votedBy.find(vote => vote.user.toString() === userId.toString());
  
  if (existingVote) {
    // Update existing vote
    if (existingVote.vote !== voteType) {
      // Remove old vote count
      if (existingVote.vote === 'helpful') {
        this.helpfulVotes = Math.max(0, this.helpfulVotes - 1);
      } else {
        this.unhelpfulVotes = Math.max(0, this.unhelpfulVotes - 1);
      }
      
      // Add new vote count
      if (voteType === 'helpful') {
        this.helpfulVotes += 1;
      } else {
        this.unhelpfulVotes += 1;
      }
      
      existingVote.vote = voteType;
    }
  } else {
    // Add new vote
    this.votedBy.push({ user: userId, vote: voteType });
    
    if (voteType === 'helpful') {
      this.helpfulVotes += 1;
    } else {
      this.unhelpfulVotes += 1;
    }
  }
  
  return this.save();
};

// Method to add vendor response
reviewSchema.methods.addVendorResponse = function(message, respondedBy) {
  this.vendorResponse = {
    message,
    respondedAt: new Date(),
    respondedBy
  };
  
  return this.save();
};

// Method to flag review
reviewSchema.methods.flag = function(reason, flaggedBy) {
  // Check if already flagged by this user for this reason
  const existingFlag = this.moderationFlags.find(
    flag => flag.flaggedBy.toString() === flaggedBy.toString() && flag.reason === reason
  );
  
  if (!existingFlag) {
    this.moderationFlags.push({
      reason,
      flaggedBy,
      flaggedAt: new Date()
    });
  }
  
  return this.save();
};

// Post-save middleware to update product and vendor ratings
reviewSchema.post('save', async function(doc) {
  try {
    // Update product rating
    const Product = mongoose.model('Product');
    const product = await Product.findById(doc.product);
    if (product) {
      await product.updateRating();
    }
    
    // Update vendor rating
    const Vendor = mongoose.model('Vendor');
    const vendor = await Vendor.findById(doc.vendor);
    if (vendor) {
      await vendor.calculateAverageRating();
    }
  } catch (error) {
    console.error('Error updating ratings after review save:', error);
  }
});

// Post-remove middleware to update product and vendor ratings
reviewSchema.post('remove', async function(doc) {
  try {
    // Update product rating
    const Product = mongoose.model('Product');
    const product = await Product.findById(doc.product);
    if (product) {
      await product.updateRating();
    }
    
    // Update vendor rating
    const Vendor = mongoose.model('Vendor');
    const vendor = await Vendor.findById(doc.vendor);
    if (vendor) {
      await vendor.calculateAverageRating();
    }
  } catch (error) {
    console.error('Error updating ratings after review removal:', error);
  }
});

// Static method to get review statistics
reviewSchema.statics.getReviewStats = function(productId) {
  return this.aggregate([
    { $match: { product: mongoose.Types.ObjectId(productId), isApproved: true } },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: '$count' },
        averageRating: { $avg: '$_id' },
        ratingDistribution: {
          $push: {
            rating: '$_id',
            count: '$count'
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Review', reviewSchema);
