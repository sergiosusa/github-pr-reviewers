// ==UserScript==
// @name         Github Pull Request Reviewers
// @namespace    https://sergiosusa.com/
// @version      0.3
// @description  Copy, paste and clear Github pull request reviewers.
// @author       You
// @match        https://github.com/*/pull/*
// @match        https://github.com/*/compare/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let graphicInterface = new GraphicInterface(new PullRequestReviewers());
    graphicInterface.render();

})();

function GraphicInterface(pullRequestReviewers) {

    this.pullRequestReviewers = pullRequestReviewers;

    this.render = () => {

        let container = document.querySelector("div.discussion-sidebar");
        container.innerHTML = this.html() + container.innerHTML;

        let copyBtn = document.getElementById('copy_btn');
        copyBtn.onclick = this.copyAndRender;
        let pasteBtn = document.getElementById('paste_btn');
        pasteBtn.onclick = this.pullRequestReviewers.paste;

        let clearBtn = document.getElementById('clear_btn');
        clearBtn.onclick = this.pullRequestReviewers.clear;

    };

    this.copyAndRender = () => {
        this.pullRequestReviewers.copy().then((() => {
            document.getElementById('selectedReviewers').innerHTML = this.reviewersHtml();
        }).bind(this));
    };

    this.html = () => {
        let html = '<div id="pr-reviewers" style="border-bottom: 1px solid #e6ebf1;margin-bottom: -11px;text-align: center;padding-bottom: 6px;" class="discussion-sidebar-item sidebar-assignee js-discussion-sidebar-item">';

        html += '<div id="selectedReviewers" style="margin-bottom: 5px;">';
        html += this.reviewersHtml();
        html += '</div>';

        html += '<button type="button" id="copy_btn" class="btn btn-sm" >Copy</button> ' +
            '<button type="button" id="paste_btn" class="btn btn-sm" >Paste</button> ' +
            '<button type="button" id="clear_btn" class="btn btn-sm" >Clear</button>' +
            '</div>';

        return html;
    };

    this.reviewersHtml = () => {
        let reviewersId = JSON.parse(localStorage.getItem('github_reviewers'));

        if (null === reviewersId) {
            reviewersId = [];
        }

        let html = '';

        for (let x = 0; x < reviewersId.length; x++) {
            html += '<img class="avatar" src="https://avatars3.githubusercontent.com/u/' + reviewersId[x] + '?s=40&amp;v=4" width="20" height="20">';
        }
        return html;
    };
}

function PullRequestReviewers() {

    this.copy = () => {

        return new Promise(((resolve) => {

            this.getReviewersButton().setAttribute('open', '');

            setTimeout((() => {

                let reviewers = document.querySelectorAll('input[name="reviewer_user_ids[]"]');
                let reviewersId = [];

                for (let x = 0; x < reviewers.length; x++) {
                    if (reviewers[x].parentNode.getAttribute("class").includes("selected")) {
                        reviewersId.push(reviewers[x].value);
                    }
                }

                this.saveReviewers(reviewersId)

            }).bind(this), 1000);

            setTimeout((() => {
                this.getReviewersButton().removeAttribute('open');
                resolve();
            }).bind(this), 2000);

        }).bind(this));
    };

    this.paste = () => {

        this.getReviewersButton().setAttribute('open', '');

        setTimeout((() => {

            let reviewers = document.querySelectorAll('input[name="reviewer_user_ids[]"]');

            let reviewersId = this.getReviewers();

            for (let x = 0; x < reviewers.length; x++) {
                if (reviewersId.includes(reviewers[x].value) && !reviewers[x].parentNode.getAttribute("class").includes("selected")) {
                    reviewers[x].click();
                }
            }

        }).bind(this), 1000);

        setTimeout((() => {
            this.getReviewersButton().removeAttribute('open');
        }).bind(this), 2000);

    };

    this.clear = () => {

        this.getReviewersButton().setAttribute('open', '');

        setTimeout(() => {

            let reviewers = document.querySelectorAll('input[name="reviewer_user_ids[]"]');

            for (let x = 0; x < reviewers.length; x++) {
                if (reviewers[x].parentNode.getAttribute("class").includes("selected")) {
                    reviewers[x].click();
                }
            }
        }, 1000);

        setTimeout((() => {
            this.getReviewersButton().removeAttribute('open');
        }).bind(this), 2000);
    };

    this.saveReviewers = (reviewersId) => {
        localStorage.setItem('github_reviewers', JSON.stringify(reviewersId));
    };

    this.getReviewers = () => {
        return JSON.parse(localStorage.getItem('github_reviewers'));
    };

    this.getReviewersButton = () => {
        let reviewersButton = document.querySelectorAll("div.sidebar-assignee > form > details");

        if (0 === reviewersButton.length) {
            reviewersButton = document.querySelectorAll("div.sidebar-assignee > div > details");
        }

        return reviewersButton[0];

    };

}
