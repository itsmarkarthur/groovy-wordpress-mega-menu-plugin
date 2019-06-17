import axios from 'axios';
import tingle from 'tingle.js';
import { resetPreviewModalState } from './modal';

document.addEventListener('DOMContentLoaded', () => {
  let dropDowns = document.querySelectorAll('.preset-options');
  let presetInners = document.querySelectorAll('.preset-inner');
  let dropdownIcons = document.querySelectorAll('.gm-dashboard-body_inner .preset-options > .fa');
  let dropdownTitles = document.querySelectorAll('.preset-title__alpha');
  let presetRenameBtns = document.querySelectorAll('.preset-rename');
  let presetSetDefaultBtns = document.querySelectorAll('.preset-set-default');
  let presetDuplicateBtns = document.querySelectorAll('.preset-duplicate');
  let presetExportBtns = document.querySelectorAll('.preset-export');
  let thumbnailBtns = document.querySelectorAll('.preset-thumbnail');
  let thumbnailUnsetBtns = document.querySelectorAll('.preset-thumbnail-unset');
  let presetDeleteBtns = document.querySelectorAll('.preset-delete');
  let createNewPresetBtn = document.querySelector('.preset--create-new');
  let presetImportFromLibBtn = document.querySelectorAll('.preset-import-from-library');
  let presetNeedScreenshot = document.querySelectorAll('.preset--need-screenshot');

  function cancelEdit () {
    dropDowns.forEach(function (dropDown) {
      if (!dropDown.classList.contains('edit-mode')) {
        return;
      }

      let preset = dropDown.closest('.preset');
      let oldName = preset.dataset.name;

      dropDown.classList.remove('edit-mode');

      preset
        .querySelector('.preset-inner')
        .classList
        .remove('active');

      preset
        .querySelector('.preset-options > .fa')
        .classList
        .add('fa-chevron-down');

      preset
        .querySelector('.preset-options > .fa')
        .classList
        .remove('fa-check');

      preset
        .querySelector('.preset-title__alpha').readOnly = true;

      preset
        .querySelector('.preset-title__alpha')
        .value = oldName;
      preset
        .querySelector('.preset-title__alpha')
        .blur();
      document.getSelection()
        .removeAllRanges();
    });
  }

  document.addEventListener('keyup', (e) => {
    if (e.keyCode === 27) {
      cancelEdit();
    }
  });

  document.addEventListener('click', () => {
    closeDropdown();
    cancelEdit();
  });

  function openDropdown (preset) {
    closeDropdown();
    preset.querySelector('.preset-inner')
      .classList
      .add('active');
  }

  function closeDropdown () {
    presetInners.forEach((presetInner) => {
      presetInner.classList.remove('active');
    });

    dropDowns.forEach((dropDown) => {
      dropDown.classList.remove('edit-mode');
    });

    dropdownIcons.forEach((dropdownIcon) => {
      dropdownIcon.classList.add('fa-chevron-down');
      dropdownIcon.classList.remove('fa-check');
    });

    dropdownTitles.forEach((dropdownTitle) => {
      dropdownTitle.readOnly = true;
    });
  }

  function savePresetName (preset, e) {
    let nameInput = preset.querySelector('.preset-title__alpha');
    let newName = nameInput.value.trim();
    let id = preset.dataset.id;

    closeDropdown();
    e.stopPropagation();

    if (newName === '') {
      alert('Preset name cannot be empty');
    } else {
      let infoBox = document.querySelector('.gm-infobox');
      let url = `${groovyMenuLocalize.GroovyMenuAdminUrl}&action=rename&id=${id}&name=${newName}`;

      infoBox.classList.remove('gm-hidden');
      preset.dataset.name = newName;

      setTimeout(function () {
        infoBox.classList.add('gm-hidden');
      }, 3000);

      axios.get(url);
    }
  }

  dropDowns.forEach((dropdown) => {
    dropdown.addEventListener('click', function (e) {
      let preset = this.closest('.preset');

      if (this.classList.contains('edit-mode')) {
        savePresetName(preset, e);
      } else {
        cancelEdit();
        e.stopPropagation();
        openDropdown(preset);
      }
    });
  });

  function renamePreset (e) {
    e.stopPropagation();

    let preset = this.closest('.preset');
    let nameInput = preset.querySelector('.preset-title__alpha');
    let strLength = nameInput.value.length * 2;
    let icon = preset.querySelector('.preset-options > .fa');

    nameInput.addEventListener('click', function (e) {
      e.stopPropagation();
    });
    nameInput.setSelectionRange(strLength, strLength);
    nameInput.readOnly = false;
    nameInput.focus();

    preset
      .querySelector('.preset-options')
      .classList
      .add('edit-mode');

    icon.classList.remove('fa-chevron-down');
    icon.classList.add('fa-check');
  }

  dropdownTitles.forEach((dropdownTitle) => {
    dropdownTitle.addEventListener('keyup', function (e) {
      let preset = this.closest('.preset');

      if (e.keyCode === 13) {
        savePresetName(preset, e);
      }
    });
  });

  // Rename
  presetRenameBtns.forEach((presetRenameBtn) => {
    presetRenameBtn.addEventListener('click', renamePreset);
  });

  // Set as default
  function setPresetAsDefault () {
    let id = this.closest('.preset').dataset.id;
    window.location = groovyMenuLocalize.GroovyMenuAdminUrl + '&action=defaultSet&id=' + id;
  }

  presetSetDefaultBtns.forEach((btn) => {
    btn.addEventListener('click', setPresetAsDefault);
  });

  // Preview
  function openPreviewModal () {
    const presetPreview = document.querySelector('#preview-modal');
    const modalBody = document.querySelector('.gm-modal-body-iframe');
    const previewBtns = document.querySelectorAll('.preset-preview');

    if (presetPreview === null) {
      return;
    }

    let presetPreviewModal = new tingle.modal({
      footer: false,
      stickyFooter: false,
      closeMethods: ['overlay', 'button', 'escape'],
      cssClass: ['gm-modal--fullscreen', 'gm-modal--preview'],
      beforeOpen () {
        let id = document.querySelector('.preset-inner.active')
          .closest('.preset').dataset.id;
        let from = 'from=api&';
        let url = `${groovyMenuLocalize.GroovyMenuSiteUrl}/?groovy-menu-preset=1&gm_action_preview=1&${from}id=${id}`;
        let previewNameHolder = document.querySelector('.modal-preview-name');
        let previewName = document.querySelector('.preset-inner.active')
          .closest('.preset').dataset.name;
        let previewModalIframe = document.createElement('iframe');

        previewModalIframe.setAttribute('id', 'gm-preview-iframe');
        previewModalIframe.setAttribute('src', url);
        previewModalIframe.style.width = '100%';
        previewModalIframe.style.height = '100%';
        previewNameHolder.innerHTML = previewName;

        modalBody.append(previewModalIframe);
        presetPreview.classList.remove('gm-hidden');
      },
      onClose () {
        let initResetModalState = resetPreviewModalState.bind(this);

        initResetModalState();

        if (document.querySelector('.gm-add-preset-from-library') !== null) {
          if (document.querySelector('.gm-add-preset-from-library').style.display !== 'none') {
            document.body.classList.add('tingle-enabled');
          }
        }

        if (modalBody.querySelector('iframe') !== null) {
          modalBody.querySelector('iframe')
            .remove();
        }
      }
    });

    presetPreviewModal.setContent(presetPreview);

    previewBtns.forEach((btn) => {
      btn.addEventListener('click', function () {
        this.closest('.preset').querySelector('.preset-inner').classList.add('active');
        presetPreviewModal.open();
      });
    });
  }

  openPreviewModal();

  // Duplicate
  function duplicatePreset () {
    let id = this.closest('.preset').dataset.id;
    window.location = groovyMenuLocalize.GroovyMenuAdminUrl + '&action=duplicate&id=' + id;
  }

  presetDuplicateBtns.forEach((btn) => {
    btn.addEventListener('click', duplicatePreset);
  });

  // Export
  function exportPreset () {
    let id = this.closest('.preset').dataset.id;
    window.location = groovyMenuLocalize.GroovyMenuAdminUrl + '&action=edit&export&id=' + id;
  }

  presetExportBtns.forEach((btn) => {
    btn.addEventListener('click', exportPreset);
  });

  // Set thumbnail
  function setThumbnail () {
    let preset = this.closest('.preset');
    let id = preset.dataset.id;
    let image;

    if (image) {
      image.open();
      return;
    }

    image = wp.media({
      title: 'Upload Image',
      multiple: false
    });

    image.on('select', function () {
      let uploadedImage = image
        .state()
        .get('selection')
        .first()
        .toJSON();

      preset
        .querySelector('.preset-placeholder img')
        .setAttribute('src', uploadedImage.url);

      let url = groovyMenuLocalize.GroovyMenuAdminUrl + '&action=setThumb&id=' + id + '&image=' + uploadedImage.id;
      axios.get(url);
    });
    image.open();
  }

  thumbnailBtns.forEach((btn) => {
    btn.addEventListener('click', setThumbnail);
  });

  // Unset thumbnail
  function unsetThumbnail () {
    let preset = this.closest('.preset');
    let id = preset.dataset.id;
    let url = groovyMenuLocalize.GroovyMenuAdminUrl + '&action=unsetThumb&id=' + id;

    axios.get(url)
      .then(() => {
        window.location.reload();
      });
  }

  thumbnailUnsetBtns.forEach((btn) => {
    btn.addEventListener('click', unsetThumbnail);
  });

  // Delete preset
  function deletePreset () {
    let isDefaultPreset = this
      .closest('.preset')
      .classList
      .contains('preset--default');

    if (isDefaultPreset) {
      alert('You can not delete the default preset');
      return false;
    }

    if (confirm('Delete this preset?')) {
      let id = this.closest('.preset').dataset.id;

      window.location = `${groovyMenuLocalize.GroovyMenuAdminUrl}&action=delete&id=${id}`;
    }
  }

  presetDeleteBtns.forEach((btn) => {
    btn.addEventListener('click', deletePreset);
  });

  // Add New preset
  if (createNewPresetBtn !== null) {
    createNewPresetBtn.addEventListener('click', () => {
      window.location = `${groovyMenuLocalize.GroovyMenuAdminUrl}&action=create`;
    });
  }

  // Import from Online library
  function importFromLibrary () {
    let url = this.dataset.href;

    axios.get(url)
      .then(() => {
        alert('Preset added');
      })
      .then(() => {
        window.location.reload();
      });
  }

  presetImportFromLibBtn.forEach((btn) => {
    btn.addEventListener('click', importFromLibrary);
  });

  // Create iframe for screenshot
  function createIframeForScreenshot (preset) {
    let id = preset.closest('.preset').dataset.id;
    let url = groovyMenuLocalize.GroovyMenuSiteUrl + '/?groovy-menu-preset=1&gm_action_preview=1&screen=1&id=' + id;
    let screenshotIframe = document.createElement('iframe');

    screenshotIframe.classList.add('gm-screenshot-iframe');
    screenshotIframe.setAttribute('id', `screenshot-iframe-${id}`);
    screenshotIframe.setAttribute('width', '1250');
    screenshotIframe.setAttribute('height', '600');
    screenshotIframe.setAttribute('src', url);

    document.body.append(screenshotIframe);
  }

  presetNeedScreenshot.forEach((preset) => {
    createIframeForScreenshot(preset);
  });

  function initGSModal () {
    let btn = document.querySelector('.gm-dashboard__global-settings-btn');
    let modalContent = document.querySelector('#global-settings-modal');
    let closeModalBtn = document.querySelector('#global-settings-modal .gm-modal-close');
    let tabs = document.querySelectorAll('.groovy-tabs');

    if (modalContent === null) {
      return;
    }

    let gsModal = new tingle.modal({
      footer: false,
      stickyFooter: false,
      closeMethods: ['overlay', 'escape'],
      cssClass: ['gm-modal--lg', 'gm-modal-overflow'],
      beforeOpen () {
        modalContent.classList.remove('gm-hidden');
      }
    });
    tabs.forEach((tab)=> {
      tab.addEventListener('click', () => gsModal.checkOverflow());
    });

    gsModal.setContent(modalContent);

    btn.addEventListener('click', () => {
      gsModal.open();
    });

    closeModalBtn.addEventListener('click', () => {
      gsModal.close();
    });
  }

  initGSModal();

  function initImportPresetModal () {
    let btn = document.querySelector('.preset--import');
    let modalContent = document.querySelector('#import-modal');
    let closeModalBtn = document.querySelector('#import-modal .gm-modal-close');

    if (modalContent === null) {
      return;
    }

    let importModal = new tingle.modal({
      footer: false,
      stickyFooter: false,
      closeMethods: ['overlay', 'escape'],
      cssClass: ['gm-modal--lg'],
      beforeOpen () {
        modalContent.classList.remove('gm-hidden');
      }
    });

    importModal.setContent(modalContent);

    btn.addEventListener('click', () => {
      importModal.open();
    });

    closeModalBtn.addEventListener('click', () => {
      importModal.close();
    });
  }

  initImportPresetModal();

  function initAddFromLibraryModal () {
    let btn = document.querySelector('.preset--add-template');
    let modalContent = document.querySelector('#add-preset-from-library');

    if (modalContent === null) {
      return;
    }

    let addFromLibModal = new tingle.modal({
      footer: false,
      stickyFooter: false,
      closeMethods: ['overlay', 'button', 'escape'],
      cssClass: ['gm-modal--fullscreen', 'gm-add-preset-from-library'],
      beforeOpen () {
        modalContent.classList.remove('gm-hidden');
      }
    });

    addFromLibModal.setContent(modalContent);

    btn.addEventListener('click', () => {
      addFromLibModal.open();
    });
  }

  initAddFromLibraryModal();
});