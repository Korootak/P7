import { createStore } from "vuex";
import axios from "axios";
import router from "../router";
import { store } from ".";

axios.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (401 === error.response.status) {
      myStore.dispatch("LogOut");
    } else {
      return Promise.reject(error);
    }
  }
);

const myStore = createStore({
  state: {
    loggedIn: false,
    feeds: [],
    user: {},
    jwt: "",
    LoginError: false,
    LoginErrorMessage: "",
    profileUpdate: false,
    profileUpdateMessage: "",
    profileDelete: false,
    profileDeleteMessage: "",
  },
  getters: {
    getLoggedIn: (state) => state.loggedIn,
    getLoggedUser: (state) => state.user,
    Feeds: (state) => state.feeds,
  },
  mutations: {
    RESETUSER(state) {
      state.user = {};
      state.jwt = "";
    },
    LOGGINGERROR(state, payload) {
      state.LoginError = payload;
    },
    LOGGINGERRORMESSAGE(state, payload) {
      state.LoginErrorMessage = payload;
    },
    PROFILEUPLOADERROR(state, payload) {
      state.profileUpdate = payload;
    },
    PROFILEUPLOADMESSAGE(state, payload) {
      state.profileUpdateMessage = payload;
    },

    PROFILEDELETEERROR(state, payload) {
      state.profileDelete = payload;
    },
    PROFILEDELETEMESSAGE(state, payload) {
      state.profileDeleteMessage = payload;
    },
    SAVEUSER(state, payload) {
      state.user = payload;
    },
    SAVEJWT(state, payload) {
      state.jwt = payload;
    },
    LOGGEDIN(state, payload) {
      state.loggedIn = payload;
    },
    AddNewFeed(state, payload) {
      state.feeds.unshift({ ...payload });
    },
    UPDATEFEED(state, payload) {
      const index = state.feeds.findIndex((object) => {
        return object._id === payload._id;
      });

      state.feeds[index] = payload;
    },
    GETALLFEEDS(state, payload) {
      state.feeds = payload;
    },
    UPDATEUSER(state, payload) {
      state.Artists = state.Artists.filter(
        (artist) => artist.id !== payload.id
      );
      state.Artists.push(payload);
    },
    UPDATEFEEDCOMMENT(state, payload) {
      const index = state.feeds.findIndex((object) => {
        return object._id === payload._id;
      });

      state.feeds[index] = payload;
      console.log(state.feeds[index].comments);
    },
    UPDATEFEEDLike(state, payload) {
      const index = state.feeds.findIndex((object) => {
        return object._id === payload._id;
      });

      state.feeds[index] = payload;
    },
    DELETEFEED(state, payload) {
      state.feeds = state.feeds.filter((f) => f._id != payload._id);
    },
  },
  actions: {
    getAllFeeds({ commit }) {
      const posts = [];
      axios
        .get("http://localhost:5000/api/feed", {
          headers: {
            "Content-Type": "Application/json",
          },
        })
        .then(async (res) => {
          console.log(res);
          for (let i = 0; i < res.data.length; i++) {
            // console.log(res.data[i].id)
            // console.log(res.data[i])
            const comments = await axios.get(
              `http://localhost:5000/api/feed/${res.data[i].id}/comments`,
              {
                headers: {
                  "Content-Type": "Application/json",
                },
              }
            );

            const likes = await axios.get(
              `http://localhost:5000/api/feed/${res.data[i].id}/likes`,
              {
                headers: {
                  "Content-Type": "Application/json",
                },
              }
            );

            posts.push({
              likes: likes.data,
              comments: comments.data,
              ...res.data[i],
            });
          }
          console.log(posts);
          commit("GETALLFEEDS", posts);
        });
    },
    signUp({ commit }, payload) {
      axios
        .post("http://localhost:5000/api/user", payload, {
          headers: {
            "Content-Type": "Application/json",
          },
        })
        .then((response) => {
          console.log(response.data);
          commit("SAVEUSER", response.data);
          commit("LOGGEDIN", true);
          router.push("/login").catch((e) => {
            console.log(e);
          });
        })
        .catch((error) => {
          commit("LOGGINGERROR", true);
          commit("LOGGINGERRORMESSAGE", error.response.data.msg);
        });
    },
    UpdateProfile({ commit }, payload) {
      console.log(payload);
      const formData = new FormData();
      if (payload.file) {
        formData.append("file", payload.file);
      }
      formData.append("email", payload.email);
      formData.append("password", payload.password);
      formData.append("name", payload.name);
      axios
        .put(`http://localhost:5000/api/user/${payload.id}`, formData, {
          headers: {
            "Content-Type": "Application/json",
          },
        })
        .then((response) => {
          console.log(response.data);
          commit("SAVEUSER", response.data);
          commit("PROFILEUPLOADERROR", true);
          commit("PROFILEUPLOADMESSAGE", "Profile Updated");

          setTimeout(() => {
            commit("PROFILEUPLOADERROR", false);
            commit("PROFILEUPLOADMESSAGE", "");
          }, 2000);
        })
        .catch((error) => {
          console.log(error);
        });
    },

    DeleteProfile({ commit }, payload) {
      axios
        .delete(`http://localhost:5000/api/user/${payload}`, {
          headers: {
            "Content-Type": "Application/json",
          },
        })
        .then((response) => {
          commit("SAVEUSER", {});
          commit("LOGGEDIN", false);
          commit(" PROFILEDELETEERROR", true);
          // commit('LOGGINGERRORMESSAGE', error.response.data.msg);
          router.push("/sign").catch((e) => {
            console.log(e);
          });
        })
        .catch((error) => {});
    },

    Login({ commit }, payload) {
      axios
        .post("http://localhost:5000/api/auth/user", payload, {
          headers: {
            "Content-Type": "Application/json",
          },
        })
        .then((response) => {
          commit("SAVEUSER", response.data?.user);
          commit("SAVEJWT", response.data?.jwtToken);
          axios.defaults.headers.common["Authorization"] =
            response.data?.jwtToken;
          commit("LOGGEDIN", true);
          if (response.data?.user?.isAdmin == 1) {
            router.push("/dashboard").catch((e) => {
              console.log(e);
            });
          } else {
            router.push("/acceuil").catch((e) => {
              console.log(e);
            });
          }
        })
        .catch((error) => {
          commit("LOGGINGERROR", true);
          commit("LOGGINGERRORMESSAGE", error.response.data.msg);

          setTimeout(() => {
            commit("LOGGINGERROR", false);
            commit("LOGGINGERRORMESSAGE", "");
          }, 5000);
        });
    },

    EditFeed({ commit, dispatch }, payload) {
      const formData = new FormData();
      if (payload.file) {
        formData.append("file", payload.file);
      }
      formData.append("text", payload.text);
      console.log(payload);
      console.log("form data...");

      axios
        .put(`http://localhost:5000/api/feed/${payload.id}`, formData, {
          headers: {
            "content-type": "multipart/form-data",
          },
        })
        .then((response) => {
          dispatch("getAllFeeds");

          // commit("UPDATEFEED", response.data);
          // console.log(response.data);
        })
        .catch((error) => {});
    },
    CreateFeed({ commit, dispatch }, payload) {
      const formData = new FormData();
      formData.append("file", payload.file);
      formData.append("text", payload.text);
      formData.append("addedBy", payload.id);

      axios
        .post("http://localhost:5000/api/feed", formData, {
          headers: {
            "content-type": "multipart/form-data",
          },
        })
        .then((response) => {
          commit("AddNewFeed", response.data);
          dispatch("getAllFeeds");
        })
        .catch((error) => {});
    },
    deleteFeed({ commit, dispatch }, payload) {
      axios
        .delete(`http://localhost:5000/api/feed/${payload.id}`, payload, {
          headers: {
            "content-type": "application/json",
          },
        })
        .then((res) => {
          console.log(res);
          dispatch("getAllFeeds");
        });
    },

    likeFeed({ commit, dispatch }, payload) {
      axios
        .put(`http://localhost:5000/api/feed/like/${payload.id}`, payload, {
          headers: {
            "content-type": "application/json",
          },
        })
        .then((res) => {
          console.log(res);
          dispatch("getAllFeeds");

          // commit("UPDATEFEEDLike", res.data);
        });
    },
    dislikedFeed({ commit, dispatch }, payload) {
      axios
        .put(`http://localhost:5000/api/feed/dislike/${payload.id}`, payload, {
          headers: {
            "content-type": "application/json",
          },
        })
        .then((res) => {
          console.log(res);
          dispatch("getAllFeeds");
          // commit("UPDATEFEEDLike", res.data);
        });
    },

    LogOut({ commit }) {
      commit("RESETUSER");
      commit("LOGGEDIN", false);
      axios.defaults.headers.common["Authorization"] = "";
      router.push("/login").catch((e) => {
        console.log(e);
      });
    },
    addComment({ commit, dispatch }, payload) {
      axios
        .post(`http://localhost:5000/api/feed/comment/${payload.id}`, payload, {
          headers: {
            "content-type": "application/json",
          },
        })
        .then((res) => {
          console.log(res);
          dispatch("getAllFeeds");
          commit("UPDATEFEEDCOMMENT", res.data);
        });
    },
    EditComment({ commit, dispatch }, payload) {
      axios
        .put(`http://localhost:5000/api/feed/comment/${payload.id}`, payload, {
          headers: {
            "content-type": "application/json",
          },
        })
        .then((res) => {
          // commit("UPDATEFEEDCOMMENT", res.data);
          dispatch("getAllFeeds");
        });
    },

    deleteComment({ commit, dispatch }, payload) {
      axios
        .put(
          `http://localhost:5000/api/feed/comment/d/${payload.id}`,
          payload,
          {
            headers: {
              "content-type": "application/json",
            },
          }
        )
        .then((res) => {
          console.log(res);
          dispatch("getAllFeeds");
          commit("UPDATEFEEDCOMMENT", res.data);
        });
    },
  },
  modules: {},
});

export default myStore;
