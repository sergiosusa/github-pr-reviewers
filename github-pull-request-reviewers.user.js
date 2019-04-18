// ==UserScript==
// @name         Github Pull Request Reviewers
// @namespace    https://sergiosusa.com/
// @version      1.0.0
// @description  Copy, paste and clear Github pull request reviewers.
// @author       You
// @match        https://github.com/*/pull/*
// @match        https://github.com/*/compare/*
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
    'use strict';
    let graphicInterface = new GraphicInterface(
        new PullRequestReviewers()
    );

    graphicInterface.render();
})();

function GraphicInterface(pullRequestReviewers) {

    this.pullRequestReviewers = pullRequestReviewers;

    this.render = () => {
        this.injectHtml();
        this.injectEventHandlers();
    };

    this.injectHtml = () => {
        let container = document.querySelector("div.discussion-sidebar");
        container.innerHTML = this.html() + container.innerHTML;
    };

    this.html = () => {
        let html = '<div id="prReviewersContainer" style="border-bottom: 1px solid #e6ebf1;margin-bottom: -11px;text-align: center;padding-bottom: 6px;" class="discussion-sidebar-item sidebar-assignee js-discussion-sidebar-item">';

        html += '<div id="reviewersGroupListContainer" style="margin-bottom: 5px;">';
        html += this.reviewersGroupsHtml();
        html += '</div>';

        html += '<div id="reviewersListContainer" style="margin-bottom: 5px;">';
        html += this.reviewersHtml();
        html += '</div>';

        html += '<button id="copyButton" type="button" title="Copy reviewers" style="width: 24px;height: 24px;background-size: 24px 24px;background: url(https://raw.githubusercontent.com/sergiosusa/github-pr-reviewers/1e6fd5cecf666dfacd8bfc5a5cd2d9df6d78d7fc/assets/copy-24.png)"  class="btn btn-sm" /> ' +
            '<button id="pasteButton" type="button" title="Paste reviewers" style="width: 24px;height: 24px;background-size: 24px 24px;background: url(https://raw.githubusercontent.com/sergiosusa/github-pr-reviewers/1e6fd5cecf666dfacd8bfc5a5cd2d9df6d78d7fc/assets/paste-24.png)" class="btn btn-sm" ></button> ' +
            '<button id="clearButton" type="button" title="Clear reviewers list" style="width: 24px;height: 24px;background-size: 24px 24px;background: url(https://raw.githubusercontent.com/sergiosusa/github-pr-reviewers/1e6fd5cecf666dfacd8bfc5a5cd2d9df6d78d7fc/assets/clear-24.png)" class="btn btn-sm" ></button>' +
            '<button id="storeGroupButton" type="button" title="Create a reviewers group" style="width: 24px;height: 24px;background-size: 24px 24px;background: url(https://raw.githubusercontent.com/sergiosusa/github-pr-reviewers/30d822f95a71f7e0962ac29075312b8c924c2bdb/assets/add-group-24.png)" class="btn btn-sm" ></button>' +
            '<button id="removeGroupButton" type="button" title="Remove a reviewers group" style="width: 24px;height: 24px;background-size: 24px 24px;background: url(https://raw.githubusercontent.com/sergiosusa/github-pr-reviewers/765aecf8374f3a0ab1dc8c426f65918e4b4797ca/assets/remove-group-24.png)" class="btn btn-sm" ></button>' +
            '<button id="importGroupButton" type="button" title="Import groups" style="width: 24px;height: 24px;background-size: 24px 24px;background: url(https://raw.githubusercontent.com/sergiosusa/github-pr-reviewers/765aecf8374f3a0ab1dc8c426f65918e4b4797ca/assets/import-24.png)" class="btn btn-sm" ></button>' +
            '<button id="exportGroupButton" type="button" title="Export groups" style="width: 24px;height: 24px;background-size: 24px 24px;background: url(https://raw.githubusercontent.com/sergiosusa/github-pr-reviewers/765aecf8374f3a0ab1dc8c426f65918e4b4797ca/assets/export-24.png)" class="btn btn-sm" ></button>' +
            '<button id="assignAuthorButton" style="margin-top: 5px;" type="button"  class="btn btn-sm" >Assign Author</button>';

        html += '</div>';

        return html;
    };

    this.reviewersGroupsHtml = () => {

        let html = '';
        let groups = this.pullRequestReviewers.getGroups();
        let currentGroup = this.pullRequestReviewers.getCurrentGroup();

        if (null !== groups) {

            html += '<div id="groups" style="margin-bottom: 5px;width: 100%;">';
            html += '<select id="groupSelect" style=";width: 100%;">';
            html += '<option value="-1"> --- </option>';

            for (let key in groups) {
                html += '<option ' + (currentGroup === key ? 'selected' : ' ') + ' value="' + key + '">' + key + '</option>';
            }

            html += '</select>';
            html += '</div>';
        }

        return html;
    };

    this.reviewersHtml = () => {
        let reviewersId = this.pullRequestReviewers.getReviewers();

        if (null === reviewersId) {
            reviewersId = [];
        }

        let html = '';

        for (let x = 0; x < reviewersId.length; x++) {
            html += '<img class="avatar" src="https://avatars3.githubusercontent.com/u/' + reviewersId[x] + '?s=40&amp;v=4" width="20" height="20">';
        }

        return html;
    };

    this.injectEventHandlers = () => {

        document.getElementById('copyButton').onclick = this.copyReviewers;
        document.getElementById('pasteButton').onclick = this.pullRequestReviewers.paste;
        document.getElementById('clearButton').onclick = this.pullRequestReviewers.clear;
        document.getElementById('assignAuthorButton').onclick = this.pullRequestReviewers.assignMe;
        document.getElementById('storeGroupButton').onclick = this.addReviewersGroup;
        document.getElementById('removeGroupButton').onclick = this.removeReviewersGroup;
        document.getElementById('exportGroupButton').onclick = this.exportGroups;
        document.getElementById('importGroupButton').onclick = this.importGroups;

        let groups = document.getElementById('groupSelect');

        if (groups) {
            groups.onchange = this.loadGroups;
        }
    };

    this.refreshGroupList = () => {
        document.getElementById('reviewersGroupListContainer').innerHTML = this.reviewersGroupsHtml();
        document.getElementById('groupSelect').onchange = this.loadGroups;
    };

    this.loadGroups = () => {
        let groupSelect = document.getElementById("groupSelect");
        let groupName = groupSelect.options[groupSelect.selectedIndex].value;

        if ("-1" === groupName) {
            return;
        }

        this.pullRequestReviewers.saveCurrentGroup(groupName);
        this.pullRequestReviewers.replaceReviewersByGroup(groupName);
        this.loadReviewers();
    };

    this.copyReviewers = () => {
        this.pullRequestReviewers.copy().then(
            this.loadReviewers
        );
    };

    this.loadReviewers = () => {
        document.getElementById('reviewersListContainer').innerHTML = this.reviewersHtml();
    };

    this.addReviewersGroup = () => {
        let groupName = prompt("Please enter a reviewers group name to add", "Group 1");

        if (!groupName) {
            return;
        }

        this.pullRequestReviewers.addReviewersGroup(groupName).then(
            this.refreshGroupList
        );
    };

    this.removeReviewersGroup = () => {
        let groupName = prompt("Please enter a reviewers group name to remove", "Group 1");

        if (!groupName) {
            return;
        }

        this.pullRequestReviewers.removeReviewersGroup(groupName).then(
            this.refreshGroupList
        );
    };

    this.exportGroups = () => {
        GM_setClipboard(
            JSON.stringify(
                this.pullRequestReviewers.getGroups()
            )
        );
        alert('Export json was copied on your clipboard');
    };

    this.importGroups = () => {
        let importedJson = prompt("Please enter a exported group json", "{}");

        if (!importedJson) {
            return;
        }

        this.pullRequestReviewers.saveGroups(
            JSON.parse(
                importedJson
            )
        );
        this.refreshGroupList();
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

    this.replaceReviewersByGroup = (groupName) => {
        let groups = this.getGroups();
        this.saveReviewers(groups[groupName]);
    };

    this.addReviewersGroup = (groupName) => {

        return new Promise(((resolve) => {
            let groups = this.getGroups();
            if (null === groups) {
                groups = {};
            }

            groups[groupName] = this.getReviewers();
            this.saveGroups(groups);
            this.saveCurrentGroup(groupName);
            resolve();
        }));
    };

    this.removeReviewersGroup = (groupName) => {
        return new Promise(((resolve) => {
            let groups = this.getGroups();
            if (null !== groups) {
                delete groups[groupName];
                if (groupName === this.getCurrentGroup()) {
                    this.saveCurrentGroup(null);
                }

                this.saveGroups(groups);
            }
            resolve();
        }));
    };

    this.getGroups = function () {
        return this.load('github_reviewers_groups');
    };

    this.saveGroups = function (groups) {
        this.store('github_reviewers_groups', groups);
    };

    this.saveCurrentGroup = (groupName) => {
        this.store('github_current_reviewers_group', groupName);
    };

    this.getCurrentGroup = () => {
        return this.load('github_current_reviewers_group');
    };


    this.assignMe = () => {

        let myGithubId = this.getMyGithubId();
        this.getAssigneesButton().setAttribute('open', '');

        setTimeout(() => {

            let assignees = document.querySelectorAll('input[name="issue[user_assignee_ids][]"]');

            for (let x = 0; x < assignees.length; x++) {
                if (myGithubId.includes(assignees[x].value) && !assignees[x].parentNode.getAttribute("class").includes("selected")) {
                    assignees[x].click();
                }
            }
        }, 1000);

        setTimeout((() => {
            this.getAssigneesButton().removeAttribute('open');
        }).bind(this), 2000);
    };

    this.getMyGithubId = () => {
        let regex = /\/hovercards\?user_id=(\d+)/i;
        let url = document.querySelectorAll("a[data-hovercard-type=user]")[0].getAttribute('data-hovercard-url');
        return url.match(regex)[1];
    };

    this.saveReviewers = (reviewersId) => {
        return this.store('github_reviewers', reviewersId);
    };

    this.getReviewers = () => {
        return this.load('github_reviewers');
    };

    this.getReviewersButton = () => {
        return this.getButtons()[0];
    };

    this.getAssigneesButton = () => {
        return this.getButtons()[1];
    };

    this.getButtons = () => {
        let assigneesButton = document.querySelectorAll("div.sidebar-assignee > form > details");

        if (0 === assigneesButton.length) {
            assigneesButton = document.querySelectorAll("div.sidebar-assignee > div > details");
        }

        return assigneesButton;
    };

    this.store = (key, data) => {
        return localStorage.setItem(key, JSON.stringify(data));
    };

    this.load = (key) => {
        return JSON.parse(localStorage.getItem(key));
    };
}
