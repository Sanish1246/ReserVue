new Vue({
  el: "#app",
  data: {
    systemMessage: null,
    currentPage: 1,
    homeOpen: true,
    lessons: [],
    fullLessons: null,
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
