import * as React from 'react';

import { Link } from 'react-router-dom';

import NoDataImages from './NoDataImages';

import LoadingBoxTop from './LoadingBoxTop';

import FullScreenList from './FullScreenList';

import SelectWrapperBlock from './SelectWrapperBlock';

import * as FileSaver from 'file-saver';

import axios from 'axios';

import JSZip from 'jszip';

import JSZipUtils from 'jszip-utils';

import customKey from '../Functions/customKey';

import getAllTabs from '../Functions/tabs/getAllTabs';

import isEquivalent from '../Functions/checkObjectsAreEqual';

import addToStore from '../Store/addToStore';

import Chart from 'chart.js';

class ModuleDownloadImages extends React.Component {
    public props: {
        [key: string]: any;
    };

    public state: {
        [key: string]: any;
    };

    public translations: {
        [key: string]: any;
    };

    public intervaller: any;

    public currentUser: string;
    
    public currentUserHash: string;

    public canvasNode: any; 

    constructor(props) {
        super(props);
        this.getAllTabs = this.getAllTabs.bind(this);
        this.getImagesFromTab = this.getImagesFromTab.bind(this);
        this.getActiveTabsTitle = this.getActiveTabsTitle.bind(this);
        this.callback = this.callback.bind(this);
        this.prev = this.prev.bind(this);
        this.next = this.next.bind(this);
        this.getPagerJsx = this.getPagerJsx.bind(this);
        this.saveImage = this.saveImage.bind(this);
        this.saveImageBase64 = this.saveImageBase64.bind(this);
        this.donwloadAllAsZipFile = this.donwloadAllAsZipFile.bind(this);
        this.packImages = this.packImages.bind(this);
        this.generateImages = this.generateImages.bind(this);
        this.setType = this.setType.bind(this);
        this.setItemsPerSite = this.setItemsPerSite.bind(this);
        this.toggleIgnoreImage = this.toggleIgnoreImage.bind(this);
        this.toggleStored = this.toggleStored.bind(this);

        this.state = {
            animationLoading: false,
            /**
             * tabs
             */
            tabs: [],
            tabsUrls: [],
            tabsJsx: [],
            activeTabId: null,
            /**
             * data
             */
            data: {},
            /**
             * images
             */
            items: [],
            itemsWithType: [],
            hostname: '',
            protocol: '',
            href: '',
            itemsToRenderJsx: [],
            filteredTypes: 'all',
            availableTypes: [],
            loadingTabsDone: false,
            currentImagesAndType: [],
            /**
             * pager
             */
            itemsPerSite: this.getItemsPerSite(),
            currentPage: 0,
            displayFullscreenlist: false,
            displayFullscreenlistFilter: false,
            sourceToIgnore: {
                0: []
            },
            sourceStored: localStorage.getItem('localImages') ? JSON.parse(localStorage.getItem('localImages')) : [],
            renderChart: false,
            chartVisibility: localStorage.getItem('chartVisibility') ? JSON.parse(localStorage.getItem('chartVisibility')) : true,
        }

        this.translations = props.translations;
    }

    componentDidMount() {
        clearInterval(this.intervaller);
        this.getAllTabs();

        this.intervaller = setInterval(async () => {
            const currentTabs = this.state.tabs;

            if (currentTabs && currentTabs.length) {
                const tabsData = await getAllTabs().then(data => data);
                const { tabs } = tabsData;

                if (!isEquivalent(tabs, currentTabs)) {
                    this.getAllTabs(false);
                }
            }
        }, 5000);
    }

    getItemsPerSite() {
        let items: any = localStorage.getItem('itemsPerSite');

        if (null === items) {
            localStorage.setItem('itemsPerSite', '10');
            items = '10';
        }

        return JSON.parse(items);
    }

    /**
     * Get all tabs as intervaller 
     * and append new tabs
     * if tabs has changed
     */
    getAllTabs(isRegularClickEvent: boolean = true) {
        this.setState({
            animationLoading: isRegularClickEvent
        }, () => {

            setTimeout(async () => {
                const tabsData = await getAllTabs().then(data => data).catch(e => []);
                const { data, tabs } = tabsData;

                this.setState({
                    data,
                    tabs,
                    animationLoading: false,
                }, () => {

                    /**
                     * Get tabid from url
                     */
                    let queryString: any = window.location.hash;

                    if (queryString) {
                        queryString = queryString.split('?tabid=');

                        if (queryString && queryString[1]) {
                            const id = queryString[1];

                            if (id && NaN !== (parseInt(id)) && isRegularClickEvent) {
                                this.getImagesFromTab(parseInt(id), true);
                            }
                        }
                    }
                });

            }, 800);
        });
    }

    /**
     * Get only domain name
     * @param {string} url
     */
    getOnlyDomainName(url) {

        if (url) {
            return url.split('/')[2];
        }

        return '';
    }

    /**
     * Get the images type
     */
    async getImagesType(url = '') {
        let type = '';

        if (url) {
            type = await axios
                .get(url)
                .then(content => {
                    const { headers } = content;
                    return headers['content-type'];
                })
                .catch(error => {

                })
        }

        return type;
    }

    getImagesFromTab(id: number, resetFilter: boolean = false) {
        let { currentPage, items, itemsWithType } = this.state;
        let itemsPerSite = this.getItemsPerSite();

        this.setState({
            animationLoading: true,
            renderChart: false
        }, () => {
            let { data, filteredTypes } = this.state;
            const { media } = data;

            /**
             * Getl all images from scratch
             */
            if (resetFilter) {
                filteredTypes = 'all';
                itemsPerSite = 10;
                currentPage = 0;
                renderChart: false
                itemsWithType = [];

                if (undefined !== media.images && undefined !== media.images[`${id}`]) {
                    items = media.images[`${id}`];
                }

                this.setState({
                    animationLoading: true,
                    itemsPerSite,
                    currentPage,
                    filteredTypes,
                    renderChart: false
                }, async () => {
                    /**
                     * Calculate all src without src inside the images
                     */
                    const availableTypesTemp = [];
                    const difference = [];
                    const availableTypes = [
                        {
                            text: 'All',
                            value: 'all',
                        }
                    ];

                    let contentData: { images: any, hostname: string, protocol: string, href: string } = {
                        images: [],
                        hostname: '',
                        protocol: '',
                        href: ''
                    };

                    contentData = await this.getDataContentScript(id);
                    let { images, hostname, protocol, href } = contentData;
                    /**
                     * Merge images from content script
                     * with images from requests
                     * and avoid dupplicates
                     */
                    for (let x = 0; x <= images.length - 1; x++) {
                        let link = images[x].src;

                        if (!items.includes(link)) {
                            /**
                             * Build valid link
                             */
                            if (-1 === link.indexOf('http://') && -1 === link.indexOf('https://') && -1 === link.indexOf('data:image') && -1 === link.indexOf('moz-extension://')) {

                                if ('/' !== link.charAt(0)) {
                                    link = `/${link}`;
                                }

                                link = `${protocol}//${hostname}${link}`;
                            }

                            /**
                             * If the link has // - 2 slashes as prefix, remove them
                             */
                            if ('//' == link.substr(0, 2) && '////' !== link.substr(0, 4)) {
                                link = `${protocol}//${link.substr(2, link.length)}`;
                            }

                            if (!items.includes(link)) {
                                items.push(link);
                            }
                        }
                    }

                    for (let x = 0; x <= items.length - 1; x++) {
                        const type = await this.getImagesType(items[x]);

                        itemsWithType.push({
                            link: items[x],
                            type
                        });
                    }

                    for (let x = 0; x <= itemsWithType.length - 1; x++) {
                        const type = itemsWithType[x].type;

                        if (!availableTypesTemp.includes(type) && '' !== type && undefined !== type) {
                            availableTypesTemp.push(type);

                            availableTypes.push(
                                {
                                    'text': type,
                                    'value': type
                                }
                            );
                        }

                        if (undefined !== type && '' !== type) {
                            if ('all' == filteredTypes) {
                                difference.push({
                                    source: itemsWithType[x].link,
                                    type
                                });
                            }
                            else {
                                if (type === filteredTypes) {
                                    difference.push({
                                        source: items[x].link,
                                        type
                                    });
                                }
                            }
                        }
                    }

                    this.setState({
                        activeTabId: id,
                        items: difference,
                        itemsWithType,
                        hostname,
                        protocol,
                        href,
                        availableTypes,
                        filteredTypes,
                        itemsPerSite
                    }, this.callback);
                });
            }

            /**
             * Get all images by filter
             */
            else {
                const difference = [];
                const tempLinks = [];

                this.setState({
                    animationLoading: true,
                    itemsPerSite,
                    currentPage,
                    filteredTypes,
                    renderChart: false
                }, () => {

                    for (let x = 0; x <= itemsWithType.length - 1; x++) {
                        const type = itemsWithType[x].type;

                        if (undefined !== type && '' !== type && !tempLinks.includes(itemsWithType[x].link)) {
                            if ('all' == filteredTypes) {
                                tempLinks.push(itemsWithType[x].link);
                                difference.push({
                                    source: itemsWithType[x].link,
                                    type
                                });
                            }
                            else {
                                if (type === filteredTypes) {
                                    tempLinks.push(itemsWithType[x].link);
                                    difference.push({
                                        source: itemsWithType[x].link,
                                        type
                                    });
                                }
                            }
                        }
                    }

                    this.setState({
                        activeTabId: id,
                        items: difference,
                        filteredTypes
                    }, this.callback);
                })
            }
        });
    }

    /**
     * Get all images from content script
     */
    async getDataContentScript(tabid: number) {
        // @ts-ignore
        return await browser.runtime.sendMessage({
            action: 'get-all-images-by-tab-id',
            tabId: tabid
        }).then(response => response)
            .catch(() => {
                return {
                    images: [],
                    hostname: '',
                    protocol: '',
                    href: ''
                };
            });
    }

    getActiveTabsTitle() {
        const { tabs, activeTabId } = this.state;

        if (undefined !== tabs[activeTabId]) {
            return this.getOnlyDomainName(tabs[activeTabId].url);
        }

        return '';
    }

    callback() {
        let { currentPage, items, sourceToIgnore } = this.state;
        currentPage = parseInt(currentPage);

        const itemsPerSite = this.getItemsPerSite();
        const start = (currentPage) * itemsPerSite;
        const end = start + itemsPerSite;

        const maxPages = this.getMaxPages();

        for (let x = 0; x <= maxPages; x++) {
            if (undefined == sourceToIgnore[x]) {
                sourceToIgnore[x] = [];
            }
        }

        this.setState({
            itemsToRender: items.slice(start, end),
            sourceToIgnore,
            renderChart: true
        }, this.generateImagesJsx);
    }

    /**
     * Change page - previous
     */
    prev() {
        let { currentPage } = this.state;

        if (currentPage !== 0) {
            this.setState({
                currentPage: currentPage - 1,
                renderChart: false
            }, this.callback);
        }
    }

    /**
     * Change page - next
     */
    next() {
        let { currentPage, items } = this.state;
        const currentCount = items.length;
        const itemsPerSite = this.getItemsPerSite();

        let mainPage = currentPage;
        mainPage++;

        if (itemsPerSite * mainPage < currentCount) {
            this.setState({
                currentPage: currentPage + 1,
                renderChart: false
            }, this.callback);
        }
    }

    /**
     * Display full screen list, items per site
     */
    displayFullscreenlist(listname: string) {
        this.setState({
            [listname]: !this.state[listname]
        });
    }

    /**
     * Get paging functionality
     */
    getPagerJsx() {
        let { currentPage, items, itemsToRenderJsx, filteredTypes, sourceToIgnore } = this.state;
        const currentCount = items.length;
        let mainPage = currentPage;
        mainPage++;

        const itemsPerSite = this.getItemsPerSite();

        return (
            <div className="paging">
                <span className="filters flex">
                    <span className="actions">
                        <span>
                            {this.translations.downloadSmall} {itemsToRenderJsx.length - sourceToIgnore[currentPage].length} (original)
                        </span>
                        <i
                            onClick={(e) => this.donwloadAllAsZipFile()}
                            className="fas fa-file-archive button-action archive-icon"
                        ></i>
                    </span>
                    <span className="actions">
                        <span>
                            {this.translations.downloadSmall} {itemsToRenderJsx.length - sourceToIgnore[currentPage].length} (as base64 string)
                        </span>
                        <i
                            onClick={(e) => this.donwloadAllAsZipFile('base64')}
                            className="fas fa-file-archive button-action archive-icon"
                        ></i>
                    </span>
                    <SelectWrapperBlock
                        callback={(e) => this.displayFullscreenlist('displayFullscreenlistFilter')}
                        iconDown='🔻'
                        iconAttributes={undefined}
                        title={`${this.translations.filter}: `}
                        selectedType={filteredTypes}
                    />
                    <br />
                    <SelectWrapperBlock
                        callback={(e) => this.displayFullscreenlist('displayFullscreenlist')}
                        iconDown='🔻'
                        iconAttributes={undefined}
                        title={`${this.translations.itemsPerSite}: `}
                        selectedType={JSON.stringify(itemsPerSite)}
                    />
                </span>
                <span className="buttons">
                    <i
                        onClick={(e) => this.prev()}
                        className={currentPage !== 0 ? 'fas fa-angle-left prev-button' : 'fas fa-angle-left prev-button deactivated'}
                    >
                    </i>
                    <i
                        onClick={(e) => this.next()}
                        className={itemsPerSite * mainPage < currentCount ? 'fas fa-angle-right next-button' : 'fas fa-angle-right next-button deactivated'}
                    >
                    </i>
                </span>
            </div>
        );
    }

    /**
     * Set filter, to filter images by its original type
     * @param e any
     */
    setType(event: React.ChangeEvent<HTMLInputElement>, object: { text: string, value: string }) {

        if (!object) {
            return this.setState({
                displayFullscreenlist: false,
                displayFullscreenlistFilter: false
            });
        }

        const { activeTabId } = this.state;

        this.setState({
            animationLoading: true,
            filteredTypes: object.value,
            currentPage: 0,
            displayFullscreenlist: false,
            displayFullscreenlistFilter: false
        }, () => {
            this.getImagesFromTab(activeTabId);
        });
    }

    /**
     * How many images should be displayed on a single site
     * @param e any
     */
    setItemsPerSite(event: React.ChangeEvent<HTMLInputElement>, object: { text: string, value: string }) {

        if (!object) {
            return this.setState({
                displayFullscreenlist: false,
                displayFullscreenlistFilter: false
            });
        }

        const { activeTabId } = this.state;
        let itemsPerSite = parseInt(object.value);

        if (typeof 1 !== typeof itemsPerSite) {
            itemsPerSite = 20;
        }

        localStorage.setItem('itemsPerSite', JSON.stringify(itemsPerSite));

        this.setState({
            animationLoading: true,
            itemsPerSite,
            currentPage: 0,
            displayFullscreenlist: false,
            displayFullscreenlistFilter: false
        }, () => {
            this.getImagesFromTab(activeTabId);
        });
    }

    /**
     * Main images to render
     */
    generateImagesJsx() {
        const { itemsToRender, protocol, hostname } = this.state;
        const itemsToRenderJsx = [];

        for (let x = 0; x <= itemsToRender.length - 1; x++) {
            let src = itemsToRender[x].source;

            if (src && typeof 'react' === typeof src) {
                let link = src;

                /**
                 * Build valid link
                 */
                if (-1 === src.indexOf('http://') && -1 === src.indexOf('https://') && -1 === src.indexOf('data:image') && -1 === src.indexOf('moz-extension://')) {

                    if ('/' !== src.charAt(0)) {
                        src = `/${src}`;
                    }

                    link = `${protocol}//${hostname}${src}`;
                }

                /**
                 * If the link has // - 2 slashes as prefix, remove them
                 */
                if ('//' == src.substr(0, 2)) {
                    link = `${protocol}//${src.substr(2, src.length)}`;
                }

                itemsToRenderJsx.push({
                    source: link,
                    type: itemsToRender[x].type
                });
            }
        }

        this.setState({
            itemsToRenderJsx,
            animationLoading: false,
        }, this.updateChart);
    }

    updateChart() {
        let images = document.querySelectorAll('.images-to-save');
        const data = [];
        const labels = [];

        if (images.length) {

            setTimeout( () => {
                images = document.querySelectorAll('.images-to-save');

                for (let x = 0; x <= images.length - 1; x++) {
                    const image: any = images[x];
                    const width = image.naturalWidth || image.clientWidth || image.width;
                    const height = image.naturalHeight || image.clientHeight || image.height;
    
                    labels.push(`${width}*${height}`);
                    data.push(width*height);
                }
    
                var barChartData = {
                    labels,
                    datasets: [
                        {
                            label: 'Images width * height',
                            backgroundColor: '#36ACA3',
                            data,
                            fill: true
                        }
                    ],
                    borderColor: [ "#36ACA3" ],
                    borderWidth: 2
                };
    
                if (this.canvasNode) {
                    const ctx = this.canvasNode.getContext('2d');
    
                    new Chart(ctx, {
                        type: 'line',
                        data: barChartData,
                        options: {
                            maintainAspectRatio: false, // to make the chart responive and css max height working
                            label: {
                                display: true,
                                text: 'Images width*height'
                            },
                            legend: {
                                display: true
                            },
                            tooltips: {
                                mode: 'index',
                                intersect: false
                            },
                            responsive: true,
                            scales: {
                                xAxes: [{
                                    stacked: true,
                                }],
                                yAxes: [{
                                    stacked: true,
                                    ticks: {
                                        beginAtZero: true
                                    }
                                }]
                            }
                        }
                    });
                }
            }, 500);
        }
    }
    /**
     * Get filetype from href as fallback
     * @param {string} href 
     */
    getFileTypeFromHref(href) {
        const possibleTypes = ['svg', 'png', 'jpg', 'jpeg', 'ico', 'gif', 'tif', 'eps', 'pdf', 'psd', 'indd', 'bmp', 'webp'];

        for (let x = 0; x <= possibleTypes.length - 1; x++) {
            const type = possibleTypes[x];
            const last4Chars = href.substr(href.length - 4);
            const last3Chars = href.substr(href.length - 3);

            if (type === last4Chars || type === last3Chars) {
                return type;
            }
        }

        if (-1 !== href.indexOf('data:image/jpg') || -1 !== href.indexOf('data:image/jpeg')) {
            return 'jpeg';
        }

        if (-1 !== href.indexOf('data:image/png')) {
            return 'png';
        }

        return 'jpeg';
    }

    /**
     * Get filetype from content-type
     * @param {string} contentType 
     */
    getFileTypeFromContentTypeResponse(contentType) {
        if (-1 !== contentType.indexOf('jpg') || -1 !== contentType.indexOf('jpeg')) {
            return 'jpeg';
        }

        if (-1 !== contentType.indexOf('png')) {
            return 'png';
        }

        if (-1 !== contentType.indexOf('svg')) {
            return 'svg';
        }

        if (-1 !== contentType.indexOf('gif')) {
            return 'gif';
        }

        if (-1 !== contentType.indexOf('webp')) {
            return 'webp';
        }

        if (-1 !== contentType.indexOf('icon')) {
            return 'ico';
        }

        const unknownType = contentType.split('/');

        if (undefined !== unknownType[1]) {
            return unknownType[1];
        }

        return 'jpeg';
    }


    /**
     * Generate a href targets href
     * to download the image
     * @param {string} href 
     */
    saveImage(href) {
        this.setState({
            animationLoading: true
        }, () => {
            axios
                .get(href)
                .then(content => {
                    /**
                     * First request is to get the correct content-type
                     * for jpg is the content-type: image/jpeg
                     * for png is the content-type: image/png
                     */
                    const optionsBlob: any = { responseType: 'blob' };

                    axios
                        .get(href, optionsBlob)
                        .then(contentBlob => {
                            /**
                             * Main request to get the content as blob
                             */
                            const { headers } = content; // content from the 1 request
                            const { data } = contentBlob;
                            const imageType = headers['content-type'];

                            try {
                                const fileType = this.getFileTypeFromHref(href);
                                const type = (undefined !== imageType) ? imageType : 'image/.' + fileType;
                                const fileEnd = this.getFileTypeFromContentTypeResponse(type);
                                const fileName = `${customKey()}.${fileEnd}`;
                                const blob = new Blob([data], { type });
                                FileSaver.saveAs(blob, fileName);
                                this.setState({ animationLoading: false });
                            }

                            catch (error) {
                                addToStore(`File generation error: ${error}`, -1);
                                this.setState({ animationLoading: false });
                            }
                        })
                        .catch(error => {
                            addToStore(`File generation error: ${error}`, -1);
                            this.setState({ animationLoading: false });
                        })
                })
                .catch(error => {
                    addToStore(`File generation error: ${error}`, -1);
                    this.setState({ animationLoading: false });
                });
        });
    }

    saveImageBase64(href) {
        const self = this;

        this.setState({
            animationLoading: true
        }, () => {
            self.toDataURL(href, function (dataUrl) {
                try {
                    const fileNameToSave = self.generateFileName(href);
                    const fileName = `${fileNameToSave}.txt`;
                    const blob = new Blob([dataUrl], { type: 'application/text' });
                    FileSaver.saveAs(blob, fileName);
                    self.setState({ animationLoading: false });
                }

                catch (error) {
                    addToStore(`File generation error: ${error}`, -1);
                    self.setState({ animationLoading: false });
                }
            });
        });
    }

    toDataURL(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            var reader = new FileReader();
            reader.onloadend = function () {
                callback(reader.result);
            }
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    }

    /**
     * 
     */
    generateImages(url) {
        return new Promise((resolve) => {
            JSZipUtils.getBinaryContent(url, function (err, data) {
                if (err) {
                    resolve('');
                } else {
                    resolve(data);
                }
            });
        });
    }

    /**
     * Get filename up to 200 (+file type = ~ 240) strings length
     * max is ~ 200
     * @param src string
     */
    generateFileName(src) {
        const names = src.split('/');
        let singleName = names[names.length - 1];

        if (200 < singleName.length) {
            singleName = singleName.substring(0, 200);
        }

        return singleName;
    }

    /**
     * Pack all images to zip file
     */
    packImages(currentImages: any, type: string = 'zip') {
        const { sourceToIgnore, currentPage } = this.state;
        const zip = new JSZip();
        const self = this;

        return new Promise(async resolve => {
            for (let x = 0; x <= currentImages.length - 1; x++) {
                const src = currentImages[x].getAttribute('src');

                if (-1 !== src.indexOf('http://') || -1 !== src.indexOf('https://') && !sourceToIgnore[currentPage].includes(src)) {

                    if ('zip' == type) {
                        const img: any = await this.generateImages(src);

                        if (img && img.byteLength) {

                            await axios
                                .get(src)
                                .then(content => {
                                    const { headers } = content;
                                    const imageType = headers['content-type'];

                                    try {
                                        const fileType = this.getFileTypeFromHref(src);
                                        const type = (undefined !== imageType) ? imageType : 'image/.' + fileType;
                                        const fileEnd = this.getFileTypeFromContentTypeResponse(type);
                                        const filename = this.generateFileName(src);
                                        zip.file(`${customKey()}-----${filename}.${fileEnd}`, img, { binary: true });
                                    }
                                    catch (error) {

                                    }
                                })
                                .catch(error => {

                                })
                        }
                    }

                    else {
                        const img: any = await self.generateImages(src);

                        if (img && img.byteLength) {
                            self.toDataURL(src, function (dataUrl) {
                                try {
                                    const fileNameToSave = self.generateFileName(src);
                                    const fileName = `${fileNameToSave}.txt`;
                                    zip.file(`${customKey()}-----${fileName}`, dataUrl, { binary: true });
                                }

                                catch (error) {

                                }
                            });
                        }
                    }
                }
            }
            return resolve(zip);
        })
    }

    /**
     * Download all images as zip file 
     */
    donwloadAllAsZipFile(type: string = 'zip') {
        this.setState({
            animationLoading: true
        }, async () => {
            try {
                const currentImages = document.querySelectorAll('.images-to-save');

                if (currentImages.length) {
                    this.packImages(currentImages, type).then((zip: any) => {

                        zip.generateAsync({ type: "blob" })
                            .then(function callback(blob) {
                                FileSaver.saveAs(blob, `${customKey()}.zip`);
                            })
                            .then(() => {
                                this.setState({ animationLoading: false });
                            })
                            .catch(() => {
                                this.setState({ animationLoading: false });
                            });
                    });
                }
                else {
                    addToStore('No valid urls are available to generate compressed file.', -1);
                    this.setState({ animationLoading: false });
                }
            } catch (error) {
                addToStore(`File generation error: ${error}`, -1);
                this.setState({ animationLoading: false });
            }
        });
    }

    getMaxPages() {
        const itemsPerSite = this.getItemsPerSite();
        const { items } = this.state;
        let maxPages: any = items.length / itemsPerSite;

        if (items.length <= itemsPerSite) {
            return parseInt(maxPages);
        }

        maxPages = Math.round(maxPages);

        if (maxPages * itemsPerSite < items.length) {
            maxPages += 1;
        }

        return maxPages;
    }

    /**
     * Generate a href targets href
     * to download the image
     * @param {string} href 
     */
    async getImagesContentAsBlob(href) {
        return await axios
            .get(href)
            .then(async (content) => {
                /**
                 * First request is to get the correct content-type
                 * for jpg is the content-type: image/jpeg
                 * for png is the content-type: image/png
                 */
                const optionsBlob: any = { responseType: 'blob' };

                return await axios
                    .get(href, optionsBlob)
                    .then(contentBlob => {
                        /**
                         * Main request to get the content as blob
                         */
                        const { headers } = content;
                        const { data } = contentBlob;
                        const imageType = headers['content-type'];

                        return {
                            type: imageType,
                            base64: data
                        }
                    })
                    .catch(error => {
                        return {
                            type: '',
                            base64: ''
                        }
                    })
            })
            .catch(error => {
                return {
                    type: '',
                    base64: ''
                }
            })
    }

    filterAvailableTypes() {
        const { availableTypes } = this.state;
        const filtered = [];
        const temp = [];

        availableTypes.map((object: { value: any; text: string }) => {
            if (!temp.includes(object.value)) {
                temp.push(object.value);
                filtered.push(object);
            }
        });

        return filtered;
    }

    toggleIgnoreImage(object) {
        const { source } = object;
        let { sourceToIgnore, currentPage } = this.state;

        if (sourceToIgnore[currentPage].includes(source)) {
            sourceToIgnore[currentPage] = sourceToIgnore[currentPage].filter(i => i != source);
        }
        else {
            sourceToIgnore[currentPage].push(source);
        }

        this.setState({
            sourceToIgnore
        });
    }

    toggleStored(object) {
        const { source } = object;
        let { sourceStored } = this.state;

        if (sourceStored.includes(source)) {
            sourceStored = sourceStored.filter(i => i != source);
            //@ts-ignore
            browser.runtime.sendMessage({ action: 'remove-image-local-store', source });
        }
        else {
            sourceStored.push(source);
            //@ts-ignore
            browser.runtime.sendMessage({ action: 'set-image-local-store', source });
        }

        this.setState({
            sourceStored
        });
    }

    toggleChart(){
        let { chartVisibility } = this.state;
        chartVisibility = !chartVisibility;
        
        localStorage.setItem('chartVisibility', JSON.stringify(chartVisibility));
        
        this.setState({ 
            chartVisibility 
        }, this.callback);
    }

    render() {
        const availableTypes = this.filterAvailableTypes();
        const { chartVisibility, activeTabId, renderChart, sourceStored, animationLoading, tabs, itemsToRenderJsx, items, displayFullscreenlist, displayFullscreenlistFilter, sourceToIgnore, currentPage } = this.state;

        return (
            <div className="DownloadImages">
                {
                    animationLoading && <LoadingBoxTop />
                }
                {
                    null !== activeTabId &&
                    <div className="tabs-active flex">
                        <div className="left">
                            <ul>
                                {
                                    tabs.map(tab => {
                                        const { url, id } = tab;

                                        return (
                                            <li
                                                key={customKey()}
                                                className="tab"
                                            >
                                                <Link
                                                    key={customKey()}
                                                    to={`/download-images?tabid=${id}`}
                                                    onClick={(e) => this.getImagesFromTab(id, true)}
                                                >
                                                    <h2
                                                        title={url}
                                                        className="ff-title h1"
                                                    >
                                                        {
                                                            url
                                                        }
                                                    </h2>
                                                </Link>
                                            </li>
                                        );
                                    })
                                }
                            </ul>
                        </div>
                        <div className="right">
                            {
                                this.getPagerJsx()
                            }
                            {
                                chartVisibility && renderChart && 0 !== items.length &&
                                <div className={0 == items.length ? 'canvas d-none' : 'canvas'}>
                                    <canvas key="myChart" id="myChart" ref={node => this.canvasNode = node} />
                                </div>
                            }
                            {
                                this.state.hostname &&
                                <h1 className="ff-title h1 text-center">
                                    {`${this.state.hostname} `} <i className="fas fa-chart-area" onClick={() => this.toggleChart()}></i>
                                </h1>
                            }
                            {
                                undefined !== items && 0 !== items.length && 0 !== this.getMaxPages() &&
                                <h1 className="ff-title h1-sites text-center">
                                    {`${this.translations.page} ${currentPage + 1} ${this.translations.of} ${this.getMaxPages()}`}
                                </h1>
                            }
                            {
                                0 !== items.length &&
                                <h1 className="ff-title h1-sites text-center">
                                    {`${items.length} ${this.translations.images}`}
                                </h1>
                            }
                            {
                                0 === this.state.itemsToRenderJsx.length &&
                                <NoDataImages />
                            }
                            {
                                0 !== itemsToRenderJsx.length &&
                                itemsToRenderJsx.map(object => {
                                    const { source, type } = object;
                                    const removed = sourceToIgnore[currentPage].includes(source);
                                    const stored = sourceStored.includes(source);

                                    return (
                                        <div
                                            key={customKey()}
                                            className={`image-box ${removed ? 'dimmed' : ''}`}
                                            title={source}
                                        >
                                            <i
                                                className={`${removed ? 'fas fa-undo restore-image' : 'fas fa-trash remove-image'}`}
                                                title={`${removed ? this.translations.restoreExclude : this.translations.exclude}`}
                                                onClick={() => this.toggleIgnoreImage(object)}
                                            />
                                            <i
                                                className={`${stored ? 'fas fa-star remove-stored' : 'far fa-star store'}`}
                                                title={`${stored ? this.translations.removeFromFavourites : this.translations.saveToFavourites}`}
                                                onClick={() => this.toggleStored(object)}
                                            />
                                            <img alt='image' className="images-to-save" src={source} />

                                            <div className="text">
                                                {
                                                    source
                                                }
                                            </div>
                                            <div className="type">
                                                {
                                                    type
                                                }
                                            </div>
                                            <div className="options">
                                                <i
                                                    className="far fa-arrow-alt-circle-down download"
                                                    onClick={(e) => this.saveImage(source)}
                                                    title={this.translations.download}
                                                ></i>
                                                <i
                                                    className="far fa-file-image download"
                                                    onClick={(e) => this.saveImageBase64(source)}
                                                    title={this.translations.download_base64}
                                                ></i>
                                                <a
                                                    target='_blank'
                                                    href={source}
                                                    className="fas fa-external-link-square-alt external-link"
                                                    title={this.translations.open_in_new_tab}
                                                ></a>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                }
                <FullScreenList
                    data={availableTypes}
                    closeIcon="✖"
                    callback={this.setType}
                    display={displayFullscreenlistFilter}
                    inputActive={true}
                    inputPlaceholder={'Filter....'}
                    noDataText=' 🗯 '
                />
                <FullScreenList
                    data={
                        [
                            {
                                text: `1 ${this.translations.itemsPerSiteSuffix}`,
                                value: 1
                            },
                            {
                                text: `2 ${this.translations.itemsPerSiteSuffix}`,
                                value: 2
                            },
                            {
                                text: `3 ${this.translations.itemsPerSiteSuffix}`,
                                value: 3
                            },
                            {
                                text: `4 ${this.translations.itemsPerSiteSuffix}`,
                                value: 4
                            },
                            {
                                text: `5 ${this.translations.itemsPerSiteSuffix}`,
                                value: 5
                            },
                            {
                                text: `10 ${this.translations.itemsPerSiteSuffix}`,
                                value: 10
                            },
                            {
                                text: `20 ${this.translations.itemsPerSiteSuffix}`,
                                value: 20
                            },
                            {
                                text: `30 ${this.translations.itemsPerSiteSuffix}`,
                                value: 30
                            },
                            {
                                text: `40 ${this.translations.itemsPerSiteSuffix}`,
                                value: 40
                            },
                            {
                                text: `50 ${this.translations.itemsPerSiteSuffix}`,
                                value: 50
                            },
                            {
                                text: `60 ${this.translations.itemsPerSiteSuffix}`,
                                value: 60
                            },
                            {
                                text: `70 ${this.translations.itemsPerSiteSuffix}`,
                                value: 70
                            },
                            {
                                text: `80 ${this.translations.itemsPerSiteSuffix}`,
                                value: 80
                            },
                            {
                                text: `90 ${this.translations.itemsPerSiteSuffix}`,
                                value: 90
                            },
                            {
                                text: `100 ${this.translations.itemsPerSiteSuffix}`,
                                value: 100
                            },
                            {
                                text: `110 ${this.translations.itemsPerSiteSuffix}`,
                                value: 110
                            },
                            {
                                text: `120 ${this.translations.itemsPerSiteSuffix}`,
                                value: 120
                            },
                            {
                                text: `130 ${this.translations.itemsPerSiteSuffix}`,
                                value: 130
                            },
                            {
                                text: `140 ${this.translations.itemsPerSiteSuffix}`,
                                value: 140
                            },
                            {
                                text: `150 ${this.translations.itemsPerSiteSuffix}`,
                                value: 150
                            },
                            {
                                text: `160 ${this.translations.itemsPerSiteSuffix}`,
                                value: 160
                            },
                            {
                                text: `170 ${this.translations.itemsPerSiteSuffix}`,
                                value: 170
                            },
                            {
                                text: `180 ${this.translations.itemsPerSiteSuffix}`,
                                value: 180
                            },
                            {
                                text: `190 ${this.translations.itemsPerSiteSuffix}`,
                                value: 190
                            },
                            {
                                text: `200 ${this.translations.itemsPerSiteSuffix}`,
                                value: 200
                            }
                        ]
                    }
                    closeIcon="✖"
                    callback={this.setItemsPerSite}
                    display={displayFullscreenlist}
                    inputActive={true}
                    inputPlaceholder={'10, 20, 30....'}
                    noDataText=' 🗯 '
                />
            </div>
        );
    }
};

export default ModuleDownloadImages;