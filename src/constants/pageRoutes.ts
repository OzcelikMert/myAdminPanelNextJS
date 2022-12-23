import PageLogin from "pages/login";
import PageLock from "pages/lock";
import PageDashboard from "pages/dashboard";
import PageSettingsProfile from "pages/settings/profile";
import PageChangePassword from "pages/settings/changePassword";
import PageGalleryList from "pages/gallery/list";
import PageGalleryUpload from "pages/gallery/upload";
import PagePostList from "pages/post/list";
import PagePostAdd from "pages/post/add";
import PagePostTermAdd from "pages/post/term/add";
import PagePostTermList from "pages/post/term/list";
import PageUserAdd from "pages/settings/user/add";
import PageUserList from "pages/settings/user/list";
import PageSettingsSEO from "pages/settings/seo";
import PageSettingsGeneral from "pages/settings/general";
import PageSubscribers from "pages/settings/subscribers";
import PageComponentAdd from "pages/component/add";
import PageComponentList from "pages/component/list";
import PageSettingsContactForms from "pages/settings/contactForms";
import PageSettingsStaticLanguages from "pages/settings/staticLanguages";
import PagePaths from "./pagePaths";

const PageRoutes = [
    {
        path: PagePaths.login(),
        element: PageLogin
    },
    {
        path: PagePaths.lock(),
        element: PageLock
    },
    {
        path: PagePaths.dashboard(),
        element: PageDashboard
    },
    {
        path: PagePaths.gallery().upload(),
        element: PageGalleryUpload
    },
    {
        path: PagePaths.gallery().list(),
        element: PageGalleryList
    },
    {
        path: PagePaths.component().add(),
        element: PageComponentAdd
    },
    {
        path: PagePaths.component().edit(),
        element: PageComponentAdd
    },
    {
        path: PagePaths.component().list(),
        element: PageComponentList
    },
    {
        path: PagePaths.post().add(),
        element: PagePostAdd
    },
    {
        path: PagePaths.post().edit(),
        element: PagePostAdd
    },
    {
        path: PagePaths.post().list(),
        element: PagePostList
    },
    {
        path: PagePaths.post().term().add(),
        element: PagePostTermAdd
    },
    {
        path: PagePaths.post().term().edit(),
        element: PagePostTermAdd
    },
    {
        path: PagePaths.post().term().list(),
        element: PagePostTermList
    },
    {
        path: PagePaths.themeContent().post().add(),
        element: PagePostAdd
    },
    {
        path: PagePaths.themeContent().post().edit(),
        element: PagePostAdd
    },
    {
        path: PagePaths.themeContent().post().list(),
        element: PagePostList
    },
    {
        path: PagePaths.themeContent().post().term().add(),
        element: PagePostTermAdd
    },
    {
        path: PagePaths.themeContent().post().term().edit(),
        element: PagePostTermAdd
    },
    {
        path: PagePaths.themeContent().post().term().list(),
        element: PagePostTermList
    },
    {
        path: PagePaths.settings().seo(),
        element: PageSettingsSEO
    },
    {
        path: PagePaths.settings().general(),
        element: PageSettingsGeneral
    },
    {
        path: PagePaths.settings().changePassword(),
        element: PageChangePassword
    },
    {
        path: PagePaths.settings().profile(),
        element: PageSettingsProfile
    },
    {
        path: PagePaths.settings().subscribers(),
        element: PageSubscribers
    },
    {
        path: PagePaths.settings().contactForms(),
        element: PageSettingsContactForms
    },
    {
        path: PagePaths.settings().staticLanguages(),
        element: PageSettingsStaticLanguages
    },
    {
        path: PagePaths.settings().user().add(),
        element: PageUserAdd
    },
    {
        path: PagePaths.settings().user().edit(),
        element: PageUserAdd
    },
    {
        path: PagePaths.settings().user().list(),
        element: PageUserList
    },
]

export default PageRoutes;