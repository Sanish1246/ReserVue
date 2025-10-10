new Vue({
  el: "#app",
  data: {
    systemMessage: null,
    currentPage: 1,
    homeOpen: true,
    lessons: [],
    fullLessons: null,
    cart: [],
    total: 0,
  },

  methods: {
    goToNextPage() {
      this.currentPage++;
    },
    goToPreviousPage() {
      this.currentPage--;
    },
    addToCart(lesson) {
      //Checking if the lesson is already present in the cart
      const existingItem = this.cart.find(
        (item) => item.tutor === lesson.tutor
      );
      if (existingItem) {
        this.showSystemMessage(`Lesson already present in cart`, 2000);
      } else {
        this.cart.push(lesson);
        lesson.spaces--;
        this.showSystemMessage(`Lesson added to cart`, 2000);
      }
      this.total += lesson.price;
    },
  },
  computed: {
    //Applying pagination when needed as we only display a maximum of 9 items at a time
    paginatedlessons() {
      const start = (this.currentPage - 1) * 9;
      return this.lessons.slice(start, start + 9).filter(Boolean);
    },
  },

  //Function that will be called upon mounting of the app to fetch the list of lessons
  mounted() {
    fetch("http://localhost:8000/lessons")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        this.lessons = [...data];
        //Saving a copy of the full list of lessons as a reference to be used when needed
        this.fullLessons = [...data];
      })
      .catch((err) => {
        this.showSystemMessage("Error: " + err, 2000);
        console.error("Error:", err);
      });
  },
});
