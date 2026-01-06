<template>
  <div class="global-rating-inline" :class="classModifier">
    <div class="card-rating card-rating--normalize">
      <div class="rating--uniform timeline-review">
        <!-- <div class="rate-star--uniform" :class="`rate-star--uniform-${starFillNumber}`">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div> -->
        rating:
        <span v-if="!isNaN(averageRating) && averageRating" class="card-average-rating">{{ averageRating }}</span>
        <span v-else class="card-average-rating">0.0</span>
        <small v-if="inlineReviewers" class>({{ inlineReviewers }})</small>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'rating-inline',
  props: {
    inlineReviewers: {
      type: Boolean,
      required: false,
    },
    averageRating: {
      type: [String, Number],
      required: false,
    },
    classModifier: {
      type: String,
      required: false,
      default: '',
    },
    starFillNumber: {
      type: [String, Number],
      required: true,
    },
  },
};
</script>

<style lang="scss">
.card-rating--normalize {
  background: transparent;
}

.card-average-rating {
  font: 16px/19px 'lato-bold';
  line-height: 12px;
}

.card-rating {
  .rating--uniform {
    &.timeline-review {
      .rate-star--uniform {
        width: auto;
        margin-right: 8px;
        span {
          &:before {
            background-color: transparent;
          }
        }
      }
    }
  }
}

.rating--uniform {
  &.timeline-review {
    justify-content: center;
    margin-bottom: 9px;
  }
  small {
    margin-top: -2px;
    color: #9b9b9b;
  }
}
</style>
