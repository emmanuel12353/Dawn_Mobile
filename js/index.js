// document.addEventListener('DOMContentLoaded', onDeviceReady, false);
document.addEventListener('deviceready', onDeviceReady, false);
document.addEventListener("backbutton", onBackKeyDown, false);

function onBackKeyDown() { }

function onDeviceReady() {
  cordova.plugins.notification.local.schedule([
    {
      id: 1,
      title: '',
      text: "Don't forget to check your activities and attend to them",
      trigger: { every: 'month' }
    },
    {
      id: 2,
      title: 'Daily Activities',
      text: "Daily activies are available - Check them out",
      trigger: { every: 'day' }
    },
    {
      id: 3,
      title: 'This week:',
      text: "We hope you find time to grow in prayer and study in the week.",
      trigger: { every: 'week' }
    }
  ]);

  function showToast(message) {
    window.plugins.toast.showWithOptions({
      message: message,
      duration: "long",
      position: "bottom",
      addPixelsY: -40
    })
  }

  function share() {
    window.plugins.socialsharing.shareWithOptions({
      message: "Hi, Don't forget to access your DawnMobile Account to start your conversion journey!", // not supported on some apps (Facebook, Instagram)
      subject: 'Share DawnMobile',
      url: 'https://slack-files.com/TBQHF85JA-F03CDP0VCR4-6ba0bf2209',
    });
  }
// }
// $(document).ready(() => {
  var currentTopicId = 1
  var currentTopicText = ""
  var currentChatWith = 1
  var disProg = true

  $(".drops").on("hide.bs.collapse", () => $(".collapseBtn").html('<span class="fa fa-angle-down fa-lg"></span>'));
  $(".drops").on("show.bs.collapse", () => $(".collapseBtn").html('<span class="fa fa-angle-up fa-lg"></span>'));

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let today = new Date();
  $("#day").text(`${days[today.getDay()]} ${today.getDate()}, ${months[today.getMonth()]} ${today.getFullYear()}`);

  let sourceUrl = 'https://dawnapp.net/api/' // 'https://dad.petrongsoftware.com/api/'; //
  let baseURI = sourceUrl.replace('api/', '');

  const loaderHide = () => {
    $(".loader").hide()
    $('.pages').scrollTop(0)
  }

  const hidePage = () => {
    $(".pages").hide()
    $('.pages').scrollTop(0)
  }
  const loaderShow = () => $('.loader').css("display", "flex");

  var addRule = (function (style) {
    var sheet = document.head.appendChild(style).sheet;
    return function (selector, css) {
      var propText = typeof css === "string" ? css : Object.keys(css).map(function (p) {
        return p + ":" + (p === "content" ? "'" + css[p] + "'" : css[p]);
      }).join(";");
      sheet.insertRule(selector + "{" + propText + "}", sheet.cssRules.length);
    };
  })(document.createElement("style"));

  const growthAnalytics = (convertsId) => {
    loaderShow()
    $.ajax({
      type: "GET",
      url: `${sourceUrl}growth/index/${convertsId}`,
      crossDomain: true,
      headers: { "Content-Type": "application/json" },
      error: () => loaderHide(),
      success: (result) => {
        $('#studiesTable').text('')
        $('#studiesProgressBar').text('')
        $('#activitiesTable').text('')
        $('#activitiesProgressBar').text('')

        let scoresTotal = 0
        let scoresDone = 0
        result.scoreTable.map(item => {
          $('#studiesTable').append(`
          <div class="row growthT" key="${item[0]}">
            <div class="col-1"> <span class="fa fa-circle" style="color: purple"></span> </div>
            <div class="col-8">
              <h5 style="text-align: left">${item[0]}</h5>
            </div>
            <div class="col-2">
              <h5 style="text-align: right">${item[2]}/${item[1]}</h5>
            </div>
          </div> `)
          scoresTotal = scoresTotal + item[1]
          scoresDone = scoresDone + item[2]

          let donePercentage = Math.floor((item[2] / item[1]) * 100)

          $(`.courseProgressText${item[3]}`).text(`${item[2]}/${item[1]}`)
          $(`.courseProgressBar${item[3]}`).text(``)
          $(`.courseProgressBar${item[3]}`).append(`<div id='bar' style='width : ${donePercentage}% ;'></div>`)

          if ((item[0] == 'Convert Study Series') && (item[2] != item[1])) disProg = false
        })

        result.activityTable.map(item => {
          $('#activitiesTable').append(`
          <div class="row growthT" key="${item[0]}">
            <div class="col-1"> <span class="fa fa-circle" style="color: purple"></span> </div>
            <div class="col-8" style='display: flex; align-content: center; min-height: 25px'>
              <h5 style="text-align: left">${item[0]}</h5>
            </div>
            <div class="col-2">
              <h5 style="text-align: right">${item[2]}/${item[1]}</h5>
            </div>
          </div> `)
        })

        let activitiesAverages = Math.floor(result.growth.activity)
        let studiesAverages = Math.floor(result.growth.score)

        $('.activitiesAverage').text(`${activitiesAverages}%`)
        $('.studiesAverage').text(`${studiesAverages}%`)

        $('#activitiesProgressBar').append(`<div id='bar' style='width : ${activitiesAverages}% ;'></div>`)
        $('#studiesProgressBar').append(`<div id='bar' style='width : ${studiesAverages}% ;'></div>`)

        if (!isConvert()) {
          $('.convertsDetail').show()
          hidePage();
          $(".growthAnalytics").show();
        }
        else {
          $('.convertsDetail').hide()
          let growth = Math.ceil(result.growth.average ? result.growth.average : 0)

          if (growth >= 0 && growth <= 19) $('.growthStatus').text('New')
          if (growth >= 20 && growth <= 49) $('.growthStatus').text('Average')
          if (growth >= 50 && growth <= 100) $('.growthStatus').text('Growing')

          $(".profilePageGrowthIndex").text(growth + '%')
          $('.avgCircle').text('') //Clearing the circle
          $('.avgCircle').append(`<div id='pie' name"${growth}" ></div>`)
          addRule(".avgCircle", {
            width: "100px",
            height: "100px"
          })
          addRule("#pie:before", {
            width: "82px",
            height: "82px",
            content: `${growth}%`
          })
          addRule("#pie", { background: `conic-gradient(#8a56ac ${growth}%, #EFEFEF 0%)` })
        }
        loaderHide()
      }
    })
  }
  const loadUserData = () => {
    let userdata = JSON.parse(localStorage.getItem("UserProfile")).user;
    let relationship = JSON.parse(localStorage.getItem("UserProfile")).relationship;
    let counselAreas = JSON.parse(localStorage.getItem("UserProfile")).counselArea;

    if (userdata.user == "convert") {
      $('.cOnly').show();
      $('.swOnly').hide();
      $(".mentorName").text(`${relationship.name}`)
      $(".mentorId").text(`ID: ${relationship.id}`)
      $(".mentorPhone").text(`Contact: ${relationship.phone}`)
      growthAnalytics(userdata.id)
    }
    else if (userdata.user == "soul winner") {
      if (userdata.id != null) $(".userId").text(`Evangelist ID: ${userdata.id}`);
      $('.cOnly').hide();
      $('.swOnly').show();
      $(".totalConverts").text((relationship.length > 0 ? relationship.length : 0) + '')
      $(".averageConvertsGrowth").text((userdata.growthAverage > 0 ? Math.floor(userdata.growthAverage) : 0) + "%")

      if (counselAreas.length > 0) {
        $(".counselAreas").hide()
        $(".noCounsellingArea").hide()
        counselAreas.map(i => $(`#${i}`).show())
      } else {
        $(".noCounsellingArea").show()
        $(".counselAreas").hide()
      }

      $('.topConvertsList').text('')
      relationship.sort((a, b) => {
        b.growthAverage - a.growthAverage
      })

      relationship.forEach((myConverts, i) => {
        if (i < 3) {
          let growths = Math.floor(myConverts.growthAverage);
          $('.topConvertsList').append(`
          <div class="topConvert" key="${i}" id="${myConverts.id}" name="${myConverts.name}">
            <h5>${myConverts.name}</h5>
            <p>Growth Average: ${growths}%</p>
          </div>
        `)
        }
      })
    }
    // User Profile
    if (userdata.profile_picture != null) $(".profilePageImg").attr("src", `${baseURI}storage/${userdata.profile_picture}`)
    $(".profilePageName").text(userdata.name ? userdata.name : '');
    $(".profilePageState").text(userdata.state ? userdata.state : '');
    if (userdata.gender == null) $(".profilePageGender").text('');
    if (userdata.gender == 'm') $(".profilePageGender").text('Male');
    if (userdata.gender == 'f') $(".profilePageGender").text('Female');
    $(".profilePageBio").text(userdata.biography ? userdata.biography : '');
    $(".profilePagePhone").text(userdata.phone ? userdata.phone : '');
    $(".profilePageEmail").text(userdata.email ? userdata.email : '');
    $(".profilePageAddress").text(userdata.address ? userdata.address : '');
    $(".profilePageCountry").text(userdata.country ? userdata.country : '');

    // Edit Profile
    $(".profileEditName").val(userdata.name);
    $(".profileEditEmail").val(userdata.email);
    $(".profileEditPhone").val(userdata.phone);
    if (userdata.gender == 'm') $(".profileEditGender").val('m');
    if (userdata.gender == 'f') $(".profileEditGender").val('f');
    $(".profileEditBio").val(userdata.biography);
    $(".profileEditState").val(userdata.state);
    $(".profileEditCountry").val(userdata.country);
    $(".profileEditAddress").val(userdata.address);
  }
  function reloadProfile() {
    let done = false
    $.ajax({
      type: "GET",
      url: sourceUrl + "profile/" + JSON.parse(localStorage.getItem("User")).user_id,
      dataType: "json",
      crossDomain: true,
      headers: { Authorization: "Bearer " + JSON.parse(localStorage.getItem("User")).token },
      error: () => loaderHide(),
      success: (result) => {
        localStorage.setItem("UserProfile", JSON.stringify(result));
        done = true;
        loaderHide()
        loadUserData()
      },
      async: false
    });
    return done;
  }
  const soulwinnerDigestView = soulwinnerresource = () => {
    if (!isConvert()) $(".swProgress").hide()
    hidePage();
    $(".soulWinnerDigestSubs").show();
  }
  
  $(".soulWinnerTab").click(() => {
    soulwinnerDigestView()
  })
  $(".evangRoadTab").click(() => { topicsView('3', 'Evangelism Roadmap') })
  $(".evangTechTab").click(() => { topicsView('6', 'Evangelism Technique') })
  $(".soulWinnerInYouTab").click(() => { topicsView('7', 'Soulwinners in You') })

  $(".discipleProgTab").click(() => {
    if (disProg) {
      topicsView('1', 'Discipleship Program')
    }
    else {
      showToast("You have to complete the Convert\'s study Series")
    }
  })
  $(".convertStudyTab").click(() => { topicsView('2', 'Converts Studies Series') })
  $(".bibleDoctrineBtn").click(() => { topicsView('5', 'Bible Doctrines') })
  $(".breakingAddictionBtn").click(() => { topicsView('8', 'Breaking Addiction') })

  $(".studyGuideBtn").click(() => {
    let StudyGuide = JSON.parse(localStorage.getItem("StudyGuide"));
    if (!StudyGuide) {
      loaderShow()
      $.ajax({
        type: "GET",
        url: sourceUrl + "downloadguide",
        dataType: "json",
        crossDomain: true,
        headers: { "Content-Type": "application/json" },
        error: () => loaderHide(),
        success: (result) => {
          localStorage.setItem("StudyGuide", JSON.stringify(result));
          loaderHide()
          load()
        },
        async: true
      });
    } else {
      load()
    }

    function load() {
      let StudyGuide = JSON.parse(localStorage.getItem("StudyGuide"));
      let verifiedDate = JSON.parse(localStorage.getItem("UserProfile")).user.email_verified_at;

      let Date2 = today.getTime();
      let Difference = Date2 - new Date(verifiedDate).getTime();
      var day = Math.ceil(Difference / (1000 * 3600 * 24));

      if (day >= 0) {
        if (day > StudyGuide.length) {
          day = day - (Math.floor(day / StudyGuide.length) * StudyGuide.length);
        }
        let n = 4;
        if (day < 4) {
          n = day
        }
        let oneWeek = StudyGuide.slice(day - n, day + (7 - n));
        $(".bibleGuide").text('')
        let daysNum = day - (Math.floor(day / 7) * 7);
        oneWeek.map((dayi, i) => {
          let curdate = new Date(Date2 - (86400000 * (daysNum - i)))
          let thisDay = `${days[curdate.getDay()]} ${curdate.getDate()}, ${months[curdate.getMonth()]} ${curdate.getFullYear()}`
          $(".bibleGuide").append(`
            <div class="row taskCard ${(i == day) ? 'itsToday' : ''} ">
              <div class="col-2">
                <i class="fa-solid fa-book-bible"></i>
              </div>
              <div class="col-9">
                <p class='day'> ${thisDay} </p>
                <h5> ${dayi.scripture} </h5>
              </div>
            </div>
          `)
        })
        hidePage();
        $(".studyGuide").show();
      }
    }
  })

  $(".profileEdit").click(() => {
    hidePage();
    JSON.parse( localStorage.getItem("Countries") ).forEach(country=>{
      $('#countries').append(`
      <option value='${country.name}' key='${country.id}'>${country.name}</option>
      `)
    })

    $(".editProfile").show();
  });
  function unreadMessages(receiver) {
    let User = JSON.parse(localStorage.getItem("User"));
    $.ajax({
      type: "POST",
      url: sourceUrl + "getunread",
      crossDomain: true,
      headers: { Authorization: "Bearer " + User.token },
      data: ({
        sender: User.user_id,
        receiver: receiver
      }),
      dataType: "json",
      error: () => {
        showToast("Error: can't load messages")
      },
      success: result => {
        if (result.status == true) {
          result.messages.forEach(message => {
            $(".chat").append(`
            <div class=${message.sender == User.user_id ? "messageSent" : "messageRecieved"}>
              <div class="message">
                <p> ${message.body} </p>
              </div>
            </div>`);
          });
        }
      },
    });
  }
  function ChatView(ConvertInChat, chatWithName) {
    currentChatWith = ConvertInChat;
    $(".chat").text('')
    loaderShow()
    let User = JSON.parse(localStorage.getItem("User"));
    $.ajax({
      type: "POST",
      url: sourceUrl + "getmessage",
      crossDomain: true,
      headers: { Authorization: "Bearer " + User.token },
      data: ({
        sender: User.user_id,
        receiver: currentChatWith
      }),
      dataType: "json",
      error: () => {
        $(".chat").text('')
        showToast("Error: can't load messages")
      },
      success: result => {
        if (result.status == true) {
          $(".chat").text('')
          result.messages.forEach(message => {
            $(".chat").append(`
            <div class=${message.sender == User.user_id ? "messageSent" : "messageRecieved"}>
              <div class="message">
                <p>${message.body}</p>
              </div>
            </div>`);
          });
          $(".chatWithName").text(chatWithName)
          hidePage()
          $(".chatting").show();
          loaderHide()
          setInterval(() => unreadMessages(currentChatWith), 5000)
        }
      },
    });
  }
  $(".sendBtn").click(() => {
    let messageBody = $(".newMessage").val()
    let User = JSON.parse(localStorage.getItem("User"));
    if (messageBody != '') {
      $.ajax({
        type: "POST",
        url: sourceUrl + "sendmessage",
        crossDomain: true,
        headers: { Authorization: "Bearer " + User.token },
        data: ({
          sender: User.user_id,
          receiver: currentChatWith,
          body: messageBody
        }),
        dataType: "json",
        error: () => {
          showToast("Error: can't load messages")
        },
        success: (result) => {
          if (result.status == true) {
            $('.chat').append(
              `<div class="messageSent">
                  <div class="message">
                    <p> ${messageBody} </p>
                  </div>
                </div>`
            )
            $(".newMessage").val('')
          }
        },
      });
    }
  })

  //App starts here
  getStarted()
  function getStarted() {
    hidePage(); //Is user already logged in?
    let User = JSON.parse(localStorage.getItem("User"));
    !User ? $(".startPage").show() : $(".continuePage").show()
  }
  $(".getStartedBtn").click(() => {
    hidePage();
    $(".signUpInPage").show();
  });
  $("#user_type").click(() => { //To Add Referrer soul winner id
    let user = $("#user_type").val();
    (user == "soul winner" || user == "") ? $(".soulWinnerId").hide() : $(".soulWinnerId").show()
  });
  //Start Sign In / up
  $(".signUpBtn").click(() => {
    if ($(".full_nameReg").val() === "" ||
        $(".emailReg").val() === "" ||
        $(".passwordReg").val() === "" ||
        $("#user_type").val() === ""
      ) {
      $(".regErr").text("Please fill in all details");
      $(".regErr").show();
    }
    else {
      $(".regErr").hide();
      loaderShow()
      $.ajax({
        type: "POST",
        url: sourceUrl + "register",
        data: JSON.stringify({
          name: $(".full_nameReg").val(),
          email: $(".emailReg").val(),
          password: $(".passwordReg").val(),
          user: $("#user_type").val(),
          soulwinner_id: $(".soulWinnerId").val()
        }),
        dataType: "json",
        crossDomain: true,
        headers: { "Content-Type": "application/json" },
        error: (error) => {
          $(".regErr").text(...error);
          $(".regErr").show();
          loaderHide()
        },
        success: result => {
          loaderHide()
          if (result.status == false) {
            $(".regErr").text(...result.message);
            $(".regErr").show();
          }
          else if (result.status == true) {
            localStorage.setItem("User", JSON.stringify(result));
            if (reloadProfile()) $("#modalRegSucc").modal("show")
          }
        },
      });
    }
  });
  $(".closeRegModal").click(() => {
    $("#modalRegSucc").modal("hide");
    $(".continuePage").show()
  });
  $(".signInBtn").click(() => {
    if ($(".signInName").val() === "" || $(".signInPassword").val() === "") {
      $(".loginErr").text("Please enter your username and password");
      $(".loginErr").show();
    } else {
      loaderShow()
      $.ajax({
        type: "POST",
        url: sourceUrl + "login",
        data: JSON.stringify({
          email: $(".signInName").val(),
          password: $(".signInPassword").val(),
        }),
        dataType: "json",
        crossDomain: true,
        headers: { "Content-Type": "application/json" },
        error: () => {
          $(".loginErr").text("could not connect, please check your internet connection");
          $(".loginErr").show();
          loaderHide()
        },
        success: (result) => {
          if (result.status == false) {
            $(".loginErr").text(result.message);
            $(".loginErr").show();
            loaderHide()
          } else if (result.status == true) {
            localStorage.setItem("User", JSON.stringify(result));
            if (reloadProfile()) {
              dashboardView()
              loaderHide()
            }
          }
        },
      });
    }
  });
  const isConvert = () => (JSON.parse(localStorage.getItem("User")).user == 'convert') ? true : false
  const dashboardView = () => {
    hidePage();
    isConvert() ? $(".cvDashboard").show() : $(".swvDashboard").show()

    if (! localStorage.getItem("Countries")){
      $.ajax({
        url: sourceUrl + "countries",
        type: "GET",
        crossDomain: true,
        dataType: "json",
        error: (error) => {
          console.log('error: ', error);
        },
        success: (result) => {
          localStorage.setItem("Countries", JSON.stringify(result))
        },
      });
    }
  }
  $(".continueToDashBoard").click(() => {
    loadUserData()
    dashboardView();
  });
  function profileView() {
    hidePage();
    $(".profile").show();
  }
  $(".profileSave").click(() => {
    let User = JSON.parse(localStorage.getItem("User"));
    loaderShow()
    $.ajax({
      url: sourceUrl + "updateProfile/" + User.user_id,
      type: "POST",
      crossDomain: true,
      headers: { Authorization: "Bearer " + User.token },
      data: {
        name: $(".profileEditName").val(),
        email: $(".profileEditEmail").val(),
        user: User.user,
        phone: $(".profileEditPhone").val(),
        gender: $(".profileEditGender").val(),
        biography: $(".profileEditBio").val(),
        state: $(".profileEditState").val(),
        country: $(".profileEditCountry").val(),
        address: $(".profileEditAddress").val(),
        password: $(".profileEditPassword").val(),
        profile_photo: "",
      },
      dataType: "json",
      error: () => {
        loaderHide()
        $(".profileErr").text("Opps, an error occured, please try again");
      },
      success: (result) => {
        if (result.status == true) reloadProfile()
        loadUserData()
        profileView();
      },
    });
  });
  //Councelling
  function chooseCounselorView(choosenSectionId) {
    let User = JSON.parse(localStorage.getItem("User"));
    $("#counselSection").text(choosenSectionId);
    hidePage();
    loaderShow()
    $.ajax({
      url: sourceUrl + "getcounselors/" + choosenSectionId,
      type: "GET",
      crossDomain: true,
      headers: { Authorization: "Bearer " + User.token },
      dataType: "json",
      error: () => {
        loaderHide()
        $(".counsellorList").text("")
        showToast("Opps, an error occured, please try again")
      },
      success: result => {
        if (result.status == true) {
          $(".counsellorList").text("");
          counselorArray = result.counselors;
          counselorArray.forEach(counselors => {
            $(".counsellorList").append(`
            <div class="pickUserCard chooseCouncellor" id="${counselors.id}" key="${counselors.name}">
              <div class="pickUserImg"> <img src="${baseURI}storage/${counselors.profile_picture}" /> </div>
              <div class="pickUserText">
                <h4 id='counselorName'>${counselors.name}</h4>
                <p>Avg. Growth: ${Math.floor(counselors.growthAverage)}%</p>
              </div>
            </div>`);
          });
          loaderHide()
          $(".chooseCounselor").show();
          let chooseCouncellor = document.querySelectorAll(".chooseCouncellor");
          for (let d = 0; d < chooseCouncellor.length; d++) {
            chooseCouncellor[d].addEventListener(
              "click", function () {
                ChatView(this.id, $(chooseCouncellor[d]).attr("key"))
              }, true
            );
          }
        }
      },
    })
  }
  //Navbar options
  $(".navPlaceOW").click(() => {
    loaderShow()
    let User = JSON.parse(localStorage.getItem("User"));
    $(".replyList").text('')
    $.ajax({
      type: "GET",
      url: `${sourceUrl}worship_place_response/${User.user_id}`,
      crossDomain: true,
      headers: { Authorization: "Bearer " + User.token },
      error: () => loaderHide(),
      success: (result) => {
        if (result.status == true) {
          if (result.replies.length > 0) {
            result.replies.map((reply, i) => {
              $(".replyList").append(`
              <div class="form-check">
                ${i}
                <div class="areaSelect">
                  <h4>${reply.name}</h4>
                  <p>${reply.address}</p>
                  <p>${reply.contact}</p>
                </div>
              </div>`)
            })
          }
          else {
            $(".replyList").text('You have no replied yet')
          }
          hidePage();
          $(".placeOfWorship").show();
        }
        loaderHide()
      }
    })

  });
  $(".profileBtn").click(() => profileView());
  $(".cvNavGrowthAnaly").click(() => {
    hidePage();
    $(".growthAnalytics").show();
  });
  $(".notification").click(() => {
    hidePage();
    $(".notificationPage").show();
  });
  $(".navConvertsDev").click(convertsDev = () => {
    hidePage();
    $(".convertsDevelopment").show();
  })
  $(".navResources").click(toResources = () => {
    hidePage();
    $(".resources").show();
  })
  $(".chatsBtn").click(chatsList = () => {
    let User = JSON.parse(localStorage.getItem("User"));
    loaderShow()
    $.ajax({
      url: sourceUrl + "chattingWith/" + User.user_id,
      type: "GET",
      crossDomain: true,
      headers: { Authorization: "Bearer " + User.token },
      dataType: "json",
      error: () => loaderHide(),
      success: (result) => {
        $(".chattingWiths").text('')
        if (result.status == true) {
          if (result.chatWith.length < 1) {
            $(".chattingWiths").append(`
              <div class="noChats"> You have not started a chat with any body yet</div>
            `);
          }
          else {
            result.chatWith.forEach(chattingWith => {
              $(".chattingWiths").append(`
              <div class="pickUserCard peopleInChat" id="${chattingWith.id}" key="${chattingWith.name}">
                <div class="pickUserImg">
                  <img src="${baseURI}storage/${chattingWith.profile_picture}" />
                </div>
                <div class="pickUserText">
                  <h4>${chattingWith.name}</h4>
                </div>
                <div class="pickUserBadge">${chattingWith.sender_messages_count > 0 ? chattingWith.sender_messages_count : ''}</div>
              </div> `)
            });
            let peopleInChat = document.querySelectorAll(".peopleInChat");
            for (let d = 0; d < peopleInChat.length; d++) {
              peopleInChat[d].addEventListener(
                "click", function () {
                  ChatView(peopleInChat[d].id, $(peopleInChat[d]).attr("key"))
                }, true
              );
            }
          }
          loaderHide()
          hidePage();
          $(".chats").show();
        }
      },
    })
  })
  $(".navCouncel").click(() => {
    hidePage();
    $(".counselPage").show();
    let chosesnSection = document.querySelectorAll(".counselOptions");
    for (let d = 0; d < chosesnSection.length; d++) {
      chosesnSection[d].addEventListener(
        "click", () => chooseCounselorView(chosesnSection[d].id), true
      );
    }
  });
  $(".closeConfirmationModal").click(() => { $("#modalConfirmation").modal("hide") });
  $(".sendPoWRequest").click(() => {
    let User = JSON.parse(localStorage.getItem("User"));

    if ($("#worshipCity").val() === "" || $("#worshipState").val() === "" || $("#worshipCountry").val() === "" || $("#worshipNote").val() === "") {
      $(".powErr").text("Please fill in all fields");
      $(".powErr").show();
    }
    else {
      $(".powErr").hide();
      $.ajax({
        url: sourceUrl + "save_worship_places",
        type: "POST",
        crossDomain: true,
        headers: { Authorization: "Bearer " + User.token },
        data: {
          user_id: User.user_id,
          city: $("#worshipCity").val(),
          state: $("#worshipState").val(),
          country: $("#worshipCountry").val(),
          request: $("#worshipNote").val(),
        },
        dataType: "json",
        error: () => loaderHide(),
        success: (result) => {
          if (result.status == true) {
            loaderHide()
            $("#modalMessage").text("Your request has been sent successfully!");
            $("#modalConfirmation").modal("show");
          }
        },
      })
    }
  });
  // Study
  function quizPage(topic_id, total, quizzes, series_id, series_title) {
    let i = -1;
    hidePage();
    $(".quizQue").show();
    let answer = new Array(total) // Preallocation for performance
    next()
    function next() {
      if (i != total) {
        let current = answer[i]
        if (!current && i >= 0) showToast("Please select an answer to proceed.")
        else i = i + 1
        if (i < total) {
          quiz = quizzes[i]
          let val = answer[i]
          if (val) $("input[name=optradio][value=" + val + "]").prop('checked', true);
          else $("input[name=optradio]").prop('checked', false);
          $("#theQuestionNumb").text(`Question: ${i + 1} of ${total}`);
          $("#theQuestion").text(quiz.question);
          $("#optionA").text(quiz.optiona);
          $("#optionB").text(quiz.optionb);
          $("#optionC").text(quiz.optionc);
          $("#optionD").text(quiz.optiond);
          stage(i)
        }
      }
    }

    function back() {
      if (i > 0) {
        if (i == total) i = i - 2
        else i = i - 1
        if (i < total) {
          quiz = quizzes[i]
          let val = answer[i]
          if (val) $("input[name=optradio][value=" + val + "]").prop('checked', true);
          else $("input[name=optradio]").prop('checked', false);
          $("#theQuestionNumb").text(`Question: ${i + 1} of ${total}`);
          $("#theQuestion").text(quiz.question);
          $("#optionA").text(quiz.optiona);
          $("#optionB").text(quiz.optionb);
          $("#optionC").text(quiz.optionc);
          $("#optionD").text(quiz.optiond);
          stage(i)
        }
      }
    }

    function stage(j) {
      $(".quizStage").text("");
      let quizMoves = `<div class="text-center">
        <div class="row" style="padding: 15px">
          <div class="col-6 backBtnQuiz" style="color: white">
            <p> <span class="prevBtn fa fa-angle-left backwardd" style="margin-right: 8px"></span> Back </p>
          </div>
          <div class="col-6 continueBtnQuiz" style="color: white">
            <p> Next <span class="prevBtn fa fa-angle-right forwardd" style="margin-left: 8px"></span> </p>
          </div>
        </div>
      </div>`
      let quizStart = `<div class="text-center">
        <div class="row">
          <div class="col-12" style="padding: 30px">
            <div class="takeQuizBtnQuiz">
              <p> <span class="fa fa-star" style="padding: 10px"></span> Submit </p>
            </div>
          </div>
        </div>
      </div>`
      // Hide Quiz start if it's a soulwinner
      if (j == total - 1) $(".quizStage").append(quizStart);
      else $(".quizStage").append(quizMoves)

      $(".continueBtnQuiz").click(() => { next() })
      $(".backBtnQuiz").click(() => { back() })

      let eachTopic = document.querySelectorAll(".quizOpt");
      for (let d = 0; d < eachTopic.length; d++) {
        eachTopic[d].addEventListener(
          "click", function () {
            answer[i] = $(eachTopic[d]).attr('value')
          }, false
        );
      }

      $(".takeQuizBtnQuiz").click(() => {
        let User = JSON.parse(localStorage.getItem("User"));
        if (!answer[j]) showToast("Please select an answer to proceed.")
        else {
          loaderShow()
          $.ajax({
            url: sourceUrl + "scores",
            type: "POST",
            crossDomain: true,
            headers: { Authorization: "Bearer " + User.token },
            data: {
              user_id: User.user_id,
              topic_id: topic_id,
              answers: answer,
            },
            dataType: "json",
            error: () => loaderHide(),
            success: (result) => {
              if (result.status == true) {
                $('#scoredPercent').text(Math.ceil(result.percent) + "%")
                $('#scored').text(result.score)
                $('#scoreTotal').text(" / " + result.total_quiz)
                $("#modalScore").modal("show");
                growthAnalytics(User.user_id)
                loaderHide()

                $(".scoreClose").click(() => {
                  $("#modalScore").modal("hide");
                  topicsView(series_id, series_title)
                })
              }
            },
          })
        }
      })
    }
  }
  function studyPage(title, topic_id, series_id, series_title) {
    let User = JSON.parse(localStorage.getItem("User"));
    let token = User.token;
    let total = 0
    let quizTotal = 0
    let i = -1;
    let studies = [];
    let quiz = [];
    $(".topicName").text(title); // Set Current Topic's title
    loaderShow()
    $.ajax({
      url: sourceUrl + `get_studies/with_topic_id/${topic_id}`,
      type: "GET",
      crossDomain: true,
      headers: { Authorization: "Bearer " + token },
      dataType: "json",
      error: () => loaderHide(),
      success: (result) => {
        if (result.status == true) {
          total = result.total_studies
          quizTotal = result.total_quizzes //Total Number of quizzes
          $("#quizNo").text(quizTotal)
          studies = result.studies // Get all stidies
          quiz = result.quizzes // Get all quizzes
          next()
          loaderHide()
        }
      }
    });
    hidePage();
    $(".studysPage").show();

    function next() {
      if (i != total) {
        i = i + 1
        if (i < total) {
          study = studies[i]
          $(".studyImg").css("background-image", `url(${baseURI}storage/${study.image})`);
          $(".studyDetail").text(`${title} : ${i + 1}/${total}`);
          let scriptures = ""
          study.scriptures.forEach(element => scriptures = scriptures + element + "; ");
          $(".studyText").text(scriptures)
          $(".studyTopic").text(study.title);
          $(".studyContent").text(study.content);
          $(".studyPonder").text(study.ponder);
          stage(i)
        }
      }
    }

    function back() {
      if (i > 0) {
        if (i == total) i = i - 2
        else i = i - 1
        if (i < total) {
          study = studies[i]
          $(".studyImg").css("background-image", `url(${baseURI}storage/${study.image})`);
          $(".studyDetail").text(`${title} : ${i + 1}/${total}`);
          let scriptures = ""
          study.scriptures.forEach(element => scriptures = scriptures + element + "; ");
          $(".studyText").text(scriptures)
          $(".studyTopic").text(study.title);
          $(".studyContent").text(study.content);
          $(".studyPonder").text(study.ponder);
          stage(i)
        }
      }
    }

    function stage(j) {
      $(".stage").text("");
      let moves = `<div class="text-center">
        <div class="row" style="padding: 15px">
          <div class="col-6 backBtn" style="color: white">
            <p> <span class="prevBtn fa fa-angle-left backwardd" style="margin-right: 8px"></span> Back </p>
          </div>
          <div class="col-6 continueBtn" style="color: white">
            <p> Next <span class="prevBtn fa fa-angle-right forwardd" style="margin-left: 8px"></span> </p>
          </div>
        </div>
      </div>`
      let toQuiz = `<div class="text-center">
        <div class="row">
          <div class="col-12" style="padding: 30px">
            <div class="takeQuizBtn">
              <p> <span class="fa fa-star" style="padding: 10px"></span>Take Quiz </p>
            </div>
          </div>
        </div>
      </div>`
      if ((j == total - 1) && (isConvert())) $(".stage").append(toQuiz);
      else $(".stage").append(moves)

      $(".continueBtn").click(() => next())
      $(".backBtn").click(() => back())
      $(".takeQuizBtn").click(() => {
        hidePage()
        $(".quiz").show()
        //Parameters : title of current topic's id, its quiz and total and Current Series and it's id
        $(".quizStartBtn").click(() => quizPage(topic_id, quizTotal, quiz, series_id, series_title))
      })
    }
  }
  function topicsView(series_id, title) {
    currentTopicId = series_id
    currentTopicText = title
    let User = JSON.parse(localStorage.getItem("User"));
    let token = User.token;
    loaderShow()
    $.ajax({
      url: sourceUrl + `get_topics/with_category_id/${series_id}/${User.user_id}`,
      type: "GET",
      crossDomain: true,
      headers: { Authorization: "Bearer " + token },
      dataType: "json",
      error: () => loaderHide(),
      success: (result) => {
        if (result.status == true) {
          $(".topicsRow").text("");
          $(".stdytitle").text(`${title}`);
          result.topics.forEach((topic, i) => {
            let eachTopic = `
            <div class="row taskCard clickbtn" done="${Math.ceil(topic.scoredpoint)}" id="${topic.id}" name="${topic.name}" desc="${topic.description}">
              <div class="col-2">
                <span>${i + 1} </span>
              </div>
              <div class="col-8"> <h5>${topic.name}</h5> </div>
              <div class="col-2 scored swProgress"> <span> ${Math.ceil(topic.scoredpoint)}% </span> </div>
            </div>`;
            $(".topicsRow").append(eachTopic);
          });
          if (!isConvert()) $(".swProgress").hide();
          loaderHide()
          hidePage();
          $(".topics").show();
          let choosenTopics = document.querySelectorAll(".clickbtn");
          for (let d = 0; d < choosenTopics.length; d++) {
            choosenTopics[d].addEventListener(
              "click", function () {
                if ((series_id == '2' || series_id == '1') && d > 0 && $(choosenTopics[d - 1]).attr('done') == 0) {
                  showToast("You have not completed the previous topic yet")
                } else {
                  $("#quizNote").text($(choosenTopics[d]).attr('desc'))
                  //Parameters: the topic title, and id, and the currets Series id and title
                  studyPage($(choosenTopics[d]).attr('name'), choosenTopics[d].id, series_id, title);
                }
              }, false
            );
          }
        }
      },
    });
  }
  // Activities
  function storeActivity(activity_id, user_activity_id, response) {
    let User = JSON.parse(localStorage.getItem("User"));
    $.ajax({
      url: `${sourceUrl}saveActivity`,
      type: 'POST',
      data: {
        activity_id: activity_id,
        user_activity_id: user_activity_id,
        user_id: User.user_id,
        answer: response
      },
      crossDomain: true,
      headers: { Authorization: "Bearer " + User.token },
      dataType: "json",
      error: (err) => {
        loaderHide();
        if (err.status == 400) showToast('Sorry, you can`t edit this activity')
      },
      success: result => {
        taskAndActivities()
        loaderHide()
      }
    })
  }
  function taskAndActivities() {
    loaderShow()
    let User = JSON.parse(localStorage.getItem("User"));
    $.ajax({
      url: sourceUrl + `activities/${User.user_id}`,
      type: "GET",
      crossDomain: true,
      headers: { Authorization: "Bearer " + User.token },
      dataType: "json",
      error: () => loaderHide(),
      success: (result) => {
        $(".activitiesList").text("");
        result.activities.map(activity => {
          $(".activitiesList").append(`
          <div class="taskCategories bottomCard" id="${activity.id}" name="${activity.type}" key="${activity.id}" question="${activity.question}"> 
            <div class="iconCircle">
              <span class="fa fa-calendar"></span>
            </div>
            <div class="textSpace">
              <p> ${activity.type}</p>
              <h3>${activity.message}</h3>
            </div>
            <div class="iconCircle" style="background-color: #8a56ac00;">
              <span class="fa fa-angle-right"></span>
            </div>
          </div>`);
        })
        loaderHide()
        hidePage();
        $(".convertTasks").show();

        let eachTasks = document.querySelectorAll(".taskCategories");
        $(".tasksList").text("");
        for (let d = 0; d < eachTasks.length; d++) {
          eachTasks[d].addEventListener("click", function () {
            $('#taskCatName').text($(eachTasks[d]).attr('name'))
            $('#taskQuestion').text($(eachTasks[d]).attr('question'))
            let activity_id = eachTasks[d].id
            result.userActivities[activity_id].map(task => {
              //Populate User Activity
              let activity_date = new Date(task.created_at)
              $(".tasksList").append(`
              <div class="row taskCard taskBtn" id="${task.id}">
                <div class="col-2">
                  <p>
                    <span class="fa fa-calendar-alt" style="padding-right: 5px"></span>
                  </p>
                </div>
                <div class="col-8"> <p class="taskDay">${activity_date.toLocaleDateString("en-US", {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}</p> </div>
                <div class="col-2"> <p><span class="fa ${(task.done == '1') ? " fa-check-circle" : " fa-minus-circle "}"></span></p> </div>
              </div>`);
              //Take an activity
              let eachTasks = document.querySelectorAll(".taskBtn");
              for (let d = 0; d < eachTasks.length; d++) {
                eachTasks[d].addEventListener(
                  "click", function () {
                    $("#modalDidYou").modal("show")
                    $(".taskYes").click(() => {
                      storeActivity(activity_id, this.id, '1')
                      $("#modalDidYou").modal("hide")
                    })
                    $(".taskNo").click(() => {
                      storeActivity(activity_id, this.id, '0')
                      $("#modalDidYou").modal("hide")
                    })
                  }
                )
              }
              hidePage();
              $(".tasksView").show();
            })
          }, false
          )
        }
      }
    })
  }
  $(".taskAndActivities").click(() => taskAndActivities());

  function showConvertsProfile(convertsId) {
    let User = JSON.parse(localStorage.getItem("User"));
    loaderShow()
    $.ajax({
      url: sourceUrl + `profile/${convertsId}`,
      type: "GET",
      crossDomain: true,
      headers: { Authorization: "Bearer " + User.token },
      dataType: "json",
      error: () => showToast('Unable to load profile'),
      success: (result) => {
        convertsProlie = result.user
        $(".convertsProfileName").text(`${convertsProlie.name ? convertsProlie.name : ''}`);
        $(".convertsProfileState").text(`${convertsProlie.state ? convertsProlie.state : ''}`);
        $(".convertsProfileCountry").text(`${convertsProlie.country ? convertsProlie.country : ''}`);

        let cGrowth = Math.ceil(convertsProlie.growthAverage ? convertsProlie.growthAverage : 0)
        if (cGrowth >= 0 && cGrowth <= 19) $('.convertsGrowthStatus').text('New')
        if (cGrowth >= 20 && cGrowth <= 49) $('.convertsGrowthStatus').text('Average')
        if (cGrowth >= 50 && cGrowth <= 100) $('.convertsGrowthStatus').text('Growing')

        $(".convertsProfileAverage").text(`${cGrowth}%`);

        $(".convertsProfileEmail").text(`${convertsProlie.email ? convertsProlie.email : ''}`);
        $(".convertsProfilePhone").text(`${convertsProlie.phone ? convertsProlie.phone : ''}`);
        if (convertsProlie.gender == null) $(".convertsProfileGender").text('');
        if (convertsProlie.gender == 'm') $(".convertsProfileGender").text('Male');
        if (convertsProlie.gender == 'f') $(".convertsProfileGender").text('Female');
        $(".convertsProfileAddress").text(`${convertsProlie.address ? convertsProlie.address : ''}`);
        if (convertsProlie.biography) $(".convertsProfileBio").text(`${convertsProlie.biography}`);
        loaderHide()
        hidePage();
        $(".convertProfileShow").show();
      }
    })
  }

  $(".swMyConverts").click(listConverts = () => {
    let relationship = JSON.parse(localStorage.getItem("UserProfile")).relationship;
    $(".listOfConverts").text("")
    hidePage();
    $(".chooseConvertScreen").show();
    loaderShow()
    relationship.forEach((myConverts, i) => {
      let growths = Math.floor(myConverts.growthAverage)
      let myConvertsRow = `
        <div class="pickUserCard chooseConvert" key="${i}" id="${myConverts.id}" name="${myConverts.name}"
          created_at="${myConverts.created_at}" growths="${growths}" profImg="${myConverts.profile_picture}">
          <div class="pickUserImg"> <img src="${baseURI}storage/${myConverts.profile_picture}" /> </div>
          <div class="pickUserText">
            <h4 style='text-transform: capitalize;'>${myConverts.name}</h4>
            <p>Growth Avg: ${growths}%</p>
          </div>
          <div class="pickUserBadge">
            ${(myConverts.email_verifed_at == null || myConverts.email_verifed_at == "") ? " <span class='fa fa-share-nodes'></span>" : ""}
          </div>
        </div>`;
      $(".listOfConverts").append(myConvertsRow);
    });
    loaderHide()
    $('.convertsDetail').text("")
    let chosesnConvert = document.querySelectorAll(".chooseConvert");
    for (let d = 0; d < chosesnConvert.length; d++) {
      chosesnConvert[d].addEventListener(
        "click", function () {
          let convertsId = this.id
          let chatName = $(this).attr('name');
          let created_at = new Date($(this).attr('created_at'))

          $('.selectedConvertsName').text($(this).attr('name'))
          let convertCard = `
          <div class="pickUserImg">
            <img class="selectedConvertsImg" src="${baseURI}storage/${$(this).attr('profImg')}" />
          </div>
          <div class="convertsDetailText">
            <h4 class='selectedConvertsName'>${$(this).attr('name')}</h4>
            <hr class='py-1'>
            <h5> Growth Avg: ${$(this).attr('growths')}%</h5>
            <p> Since: ${created_at.toLocaleDateString("en-US", {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})} </p>
          </div>`
          $('.convertsDetail').append(convertCard)
          hidePage();
          $(".selectConvertsOptions").show();
          let councOptions = document.querySelectorAll('.councOptions')
          for (let d = 0; d < councOptions.length; d++) {
            councOptions[d].addEventListener(
              "click", function () {
                switch (this.id) {
                  case 'Analytic':
                    growthAnalytics(convertsId)
                    break
                  case 'Profile':
                    showConvertsProfile(convertsId)
                    break
                  case 'Chat':
                    ChatView(convertsId, chatName)
                    break
                  case 'Profile':
                    break
                  case 'Share':
                    share()
                    break
                }
              }, true
            );
          }
        }, true
      );
    }
  });
  $('.addConvBtn').click(() => {
    hidePage();
    $(".addConvert").show();
  })
  $('.addConvertBtn').click(() => {
    let User = JSON.parse(localStorage.getItem("User"));
    if (
      $('#addConvertName').val() === "" ||
      $('#addConvertEmail').val() === "" ||
      $('#addConvertPhone').val() === "" ||
      $('.addConvertGender').val() === "" ||
      $('#addConvertAddress').val() === ""
    ) {
      $(".powErr").text("Please fill in all fields");
      $(".powErr").show();
    }
    else if ($('#addConvertName').val().length < 6) {
      $(".powErr").text("Please, enter your full name");
      $(".powErr").show();
    }
    else {
      $(".powErr").hide();
      $.ajax({
        url: sourceUrl + "create/convert",
        type: "POST",
        crossDomain: true,
        headers: { Authorization: "Bearer " + User.token },
        data: {
          name: $('#addConvertName').val(),
          email: $('#addConvertEmail').val(),
          phone: $("#addConvertPhone").val(),
          gender: $(".addConvertGender").val(),
          address: $("#addConvertAddress").val(),
          soulwinner_id: User.user_id
        },
        dataType: "json",
        error: () => loaderHide(),
        success: (result) => {
          if (result.status == true) {
            reloadProfile()
            loaderHide()
            $("#modalMessage").text("New convert has been created successfully!");
            $("#modalConfirmation").modal("show");
            listConverts()
            $('#add_converts_form')[0].reset()
          }
        },
      })
    }
  })

  $(".setCounselAreas").click(() => {
    hidePage();
    $(".setCounselAreasPage").show();
  })
  $(".saveCouncelingAreas").click(() => {
    let User = JSON.parse(localStorage.getItem("User"));
    var checkBox = document.querySelectorAll(".areaSelect");
    var counsel_area = [];
    for (var i = 0; i < checkBox.length; i++) {
      if (checkBox[i].checked) counsel_area.push(checkBox[i].value)
    }
    $.ajax({
      url: sourceUrl + "updateareas",
      type: "POST",
      crossDomain: true,
      headers: { Authorization: "Bearer " + User.token },
      data: {
        soulwinner_id: User.user_id,
        counsel_area: counsel_area
      },
      dataType: "json",
      error: () => loaderHide(),
      success: (result) => {
        if (result.status == true) {
          loaderHide()
          $("#modalMessage").text("Your Counsel Areas has been set successfully!");
          $("#modalConfirmation").modal("show");
          reloadProfile()
        }
      },
    })
  })
// TODO: Remove this line
// hidePage();
// $(".editProfile").show();

  // Back Buttons
  $(".backToDashboard").click(() => dashboardView())
  $(".backToProfile").click(() => {
    hidePage();
    $(".profile").show();
  })
  $(".backToTopics").click(() => {
    hidePage();
    topicsView(currentTopicId, currentTopicText)
  })
  $(".backToCounselPage").click(() => {
    hidePage();
    $(".counselPage").show();
  })
  $(".backToChats").click(() => {
    chatsList()
  })
  $('.backFromAnalytics').click(() => {
    isConvert() ? dashboardView() : listConverts()
  })
  $('.backToResources').click(() => { toResources() })
  $('.backFromTopics').click(() => {
    (currentTopicId == '8' || currentTopicId == '5') ? toResources() : convertsDev()
    if (!isConvert()) soulwinnerresource()
  })
  $('.backFromSoulWinnerDigest').click(() => {
    if (!isConvert()) dashboardView()
    else {
      (currentTopicId == '8' || currentTopicId == '5') ? toResources() : convertsDev()
    }
  })

  $(".logout").click(() => {
    localStorage.removeItem('StudyGuide')
    localStorage.removeItem("User")
    localStorage.removeItem("UserProfile")
    getStarted();
  });

  function imgSuccess(imageUri) {
    let User = JSON.parse(localStorage.getItem("User"))
    var options = new FileUploadOptions();
    options.fileKey = "profile_picture";
    options.fileName = imageUri.substr(imageUri.lastIndexOf('/') + 1);
    options.mimeType = "image/jpeg";
    options.chunkedMode = false;
    options.headers = {'Authorization': 'Bearer ' + User.token};
    var ft = new FileTransfer();
    ft.onprogress = progress => {
      $("#uploadProgress").val(Math.floor(progress.loaded / progress.total * 100));
      $("#uploadProgress").show()
    }
    ft.upload(imageUri, encodeURI(sourceUrl+"profile-upload/"+User.user_id), (res)=>{
      $("#uploadProgress").hide()
      reloadProfile()
    },(err)=> console.log('error: ', err), options);
  }

  const picture = {
    takePic: ev => {
      ev.preventDefault();
      ev.stopPropagation();
      navigator.camera.getPicture(
        imageUri => imgSuccess(imageUri),
        error => console.log(error),
        {
          quality: 70,
          destinationType: Camera.DestinationType.FILE_URI,
          sourceType: Camera.PictureSourceType.CAMERA,
          allowEdit: false,
          correctOrientation: true,
          encodingType: Camera.EncodingType.JPEG,
          mediaType: Camera.MediaType.PICTURE
        }
      );
    }
  }
  $(".changeProImage").click(e => picture.takePic(e));
}
// )